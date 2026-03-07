const mongoose = require("mongoose");

const MARKETPLACE_CATEGORIES = [
  // Agripreneur inputs
  "seeds",
  "fertilizers",
  "farm_tools",
  "animal_feed",
  "farm_inputs",
  // Farmer produce
  "maize",
  "vegetables",
  "fruits",
  "milk",
  "other",
];

const marketplaceProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: MARKETPLACE_CATEGORIES,
    },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, trim: true }, // e.g. kg, bag, litre, piece
    images: [{ type: String }],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerType: {
      type: String,
      enum: ["agripreneur", "farmer"],
      required: true,
    },
    location: { type: String, required: true, trim: true },
    isOutOfStock: { type: Boolean, default: false },
  },
  { timestamps: true }
);

marketplaceProductSchema.index({ category: 1, sellerType: 1 });
marketplaceProductSchema.index({ seller: 1 });
marketplaceProductSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("MarketplaceProduct", marketplaceProductSchema);
module.exports.MARKETPLACE_CATEGORIES = MARKETPLACE_CATEGORIES;
