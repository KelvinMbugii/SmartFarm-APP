const express = require("express");
const MarketplaceProduct = require("../models/MarketplaceProduct");
const Order = require("../models/Order");
const User = require("../models/user");
const auth = require("../middlewares/auth");
const { sendOrderNotificationToSeller } = require("../utils/orderNotifications");

const router = express.Router();
const userId = (req) => req.user._id.toString();

// ---------- Dashboard stats (agripreneur) ----------
router.get(
  "/dashboard/stats",
  auth.protect,
  auth.authorizeRoles("agripreneur"),
  async (req, res) => {
    try {
      const sid = userId(req);
      const [totalProducts, ordersReceived, pendingOrders, completedOrders, revenueResult] =
        await Promise.all([
          MarketplaceProduct.countDocuments({ seller: sid }),
          Order.countDocuments({ seller: sid }),
          Order.countDocuments({ seller: sid, status: "pending" }),
          Order.countDocuments({
            seller: sid,
            status: { $in: ["delivered", "completed"] },
          }),
          Order.aggregate([
            { $match: { seller: req.user._id, paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
        ]);
      const totalRevenue = revenueResult[0]?.total ?? 0;
      res.json({
        totalProducts,
        ordersReceived,
        pendingOrders,
        completedOrders,
        totalRevenue,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ---------- List marketplace products (public or filtered) ----------
router.get("/products", async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      location,
      search,
      sellerType,
      page = 1,
      limit = 24,
    } = req.query;
    const query = { isOutOfStock: false };
    if (category) query.category = category;
    if (sellerType) query.sellerType = sellerType;
    if (location)
      query.location = new RegExp(location.replace(/,/g, "\\s*"), "i");
    if (minPrice != null || maxPrice != null) {
      query.price = {};
      if (minPrice != null) query.price.$gte = Number(minPrice);
      if (maxPrice != null) query.price.$lte = Number(maxPrice);
    }
    if (search)
      query.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, parseInt(limit, 10) || 24);
    const limitNum = Math.min(50, parseInt(limit, 10) || 24);
    const [products, total] = await Promise.all([
      MarketplaceProduct.find(query)
        .populate("seller", "name location Phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MarketplaceProduct.countDocuments(query),
    ]);
    res.json({
      products,
      total,
      page: Math.max(1, parseInt(page, 10)),
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Get single product ----------
router.get("/products/:id", async (req, res) => {
  try {
    const product = await MarketplaceProduct.findById(req.params.id).populate(
      "seller",
      "name location Phone email"
    );
    if (!product)
      return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Create product (agripreneur or farmer) ----------
router.post(
  "/products",
  auth.protect,
  auth.authorizeRoles("agripreneur", "farmer"),
  async (req, res) => {
    try {
      const sid = userId(req);
      const sellerType = req.user.role === "agripreneur" ? "agripreneur" : "farmer";
      const body = {
        ...req.body,
        seller: sid,
        sellerType,
      };
      if (Array.isArray(body.images)) body.images = body.images.filter(Boolean);
      const product = new MarketplaceProduct(body);
      await product.save();
      await product.populate("seller", "name location Phone");
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ---------- Update product (owner) ----------
router.put(
  "/products/:id",
  auth.protect,
  auth.authorizeRoles("agripreneur", "farmer"),
  async (req, res) => {
    try {
      const product = await MarketplaceProduct.findOne({
        _id: req.params.id,
        seller: userId(req),
      });
      if (!product)
        return res.status(404).json({ error: "Product not found" });
      const allowed = [
        "name",
        "category",
        "description",
        "price",
        "stockQuantity",
        "unit",
        "images",
        "location",
        "isOutOfStock",
      ];
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) product[key] = req.body[key];
      });
      await product.save();
      await product.populate("seller", "name location Phone");
      res.json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ---------- Delete product (owner) ----------
router.delete(
  "/products/:id",
  auth.protect,
  auth.authorizeRoles("agripreneur", "farmer"),
  async (req, res) => {
    try {
      const product = await MarketplaceProduct.findOneAndDelete({
        _id: req.params.id,
        seller: userId(req),
      });
      if (!product)
        return res.status(404).json({ error: "Product not found" });
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ---------- My products (seller) ----------
router.get(
  "/my-products",
  auth.protect,
  auth.authorizeRoles("agripreneur", "farmer"),
  async (req, res) => {
    try {
      const products = await MarketplaceProduct.find({ seller: userId(req) })
        .sort({ createdAt: -1 })
        .lean();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ---------- Place order ----------
router.post("/orders", auth.protect, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body; // items: [{ productId, quantity }]
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "Items are required" });

    const buyerId = req.user._id;
    const orderItems = [];
    let sellerId = null;
    let totalAmount = 0;

    for (const row of items) {
      const product = await MarketplaceProduct.findById(row.productId);
      if (!product)
        return res.status(400).json({ error: `Product not found: ${row.productId}` });
      if (product.seller.toString() === buyerId.toString())
        return res.status(400).json({ error: "Cannot order your own product" });
      if (product.isOutOfStock || product.stockQuantity < (row.quantity || 1))
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity} ${product.unit}`,
        });
      if (sellerId && product.seller.toString() !== sellerId.toString())
        return res.status(400).json({ error: "All items must be from the same seller" });

      sellerId = product.seller;
      const qty = Math.max(1, parseInt(row.quantity, 10) || 1);
      const unitPrice = product.price;
      orderItems.push({
        product: product._id,
        quantity: qty,
        unitPrice,
        productName: product.name,
      });
      totalAmount += qty * unitPrice;
    }

    const buyer = await User.findById(buyerId).select("name Phone").lean();
    const order = new Order({
      buyer: buyerId,
      seller: sellerId,
      items: orderItems,
      totalAmount,
      buyerName: buyer?.name,
      buyerPhone: buyer?.Phone || req.body.buyerPhone,
      shippingAddress: shippingAddress || "",
    });
    await order.save();
    await order.populate("seller", "name Phone mpesaPhone");
    await order.populate("buyer", "name Phone");
    await order.populate("items.product", "name unit");

    const seller = await User.findById(sellerId).select("Phone mpesaPhone").lean();
    const notifyPhone = seller?.mpesaPhone || seller?.Phone;
    if (notifyPhone) {
      const firstItem = orderItems[0];
      sendOrderNotificationToSeller(
        notifyPhone,
        {
          productName: firstItem.productName,
          quantity: firstItem.quantity,
          buyerName: buyer?.name || "Buyer",
          buyerContact: buyer?.Phone || order.buyerPhone || "",
        }
      ).catch((e) => console.error("Order notification error:", e));
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- My orders (buyer or seller) ----------
router.get("/orders", auth.protect, async (req, res) => {
  try {
    const { as } = req.query; // "buyer" | "seller"
    const sid = userId(req);
    const query = as === "seller" ? { seller: sid } : { buyer: sid };
    const orders = await Order.find(query)
      .populate("buyer", "name Phone")
      .populate("seller", "name Phone")
      .populate("items.product", "name unit images")
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Get single order ----------
router.get("/orders/:id", auth.protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name Phone email")
      .populate("seller", "name Phone email")
      .populate("items.product", "name unit images price");
    if (!order) return res.status(404).json({ error: "Order not found" });
    const sid = userId(req);
    const isBuyer = order.buyer._id.toString() === sid;
    const isSeller = order.seller._id.toString() === sid;
    if (!isBuyer && !isSeller)
      return res.status(403).json({ error: "Not authorized to view this order" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Update order status (seller) ----------
router.patch(
  "/orders/:id/status",
  auth.protect,
  auth.authorizeRoles("agripreneur", "farmer"),
  async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        seller: userId(req),
      });
      if (!order) return res.status(404).json({ error: "Order not found" });
      const { status } = req.body;
      const allowed = ["pending", "confirmed", "shipped", "delivered", "completed", "cancelled"];
      if (!status || !allowed.includes(status))
        return res.status(400).json({ error: "Invalid status" });
      order.status = status;
      await order.save();
      await order.populate("buyer", "name Phone");
      await order.populate("seller", "name Phone");
      await order.populate("items.product", "name unit");
      res.json(order);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ---------- Initiate M-Pesa payment (stub: mark as paid for demo) ----------
router.post(
  "/orders/:id/pay",
  auth.protect,
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });
      if (order.buyer.toString() !== userId(req))
        return res.status(403).json({ error: "Only the buyer can pay for this order" });
      if (order.paymentStatus === "paid")
        return res.json({ ...order.toObject(), message: "Already paid" });

      // Stub: In production, call M-Pesa API (e.g. Daraja), then set paymentStatus on callback.
      const { confirmPayment } = req.body;
      if (confirmPayment === true) {
        order.paymentStatus = "paid";
        await order.save();
        return res.json({ ...order.toObject(), message: "Payment confirmed" });
      }
      res.json({
        message: "M-Pesa payment initiated. Use confirmPayment: true to simulate success.",
        orderId: order._id,
        totalAmount: order.totalAmount,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
