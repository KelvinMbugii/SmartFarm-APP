/**
 * Order notifications (SMS/WhatsApp) for agripreneurs when a farmer places an order.
 * Integrate with Twilio or Africa's Talking by replacing the stub implementation.
 */

const sendOrderNotificationToSeller = async (sellerPhone, orderDetails) => {
  const { productName, quantity, buyerName, buyerContact } = orderDetails;
  const message = `New SmartFarm order: ${productName} x ${quantity}. Buyer: ${buyerName}, Contact: ${buyerContact}.`;

  // Stub: log only. Replace with Twilio/Africa's Talking API call.
  if (process.env.TWILIO_ACCOUNT_SID || process.env.AFRICAS_TALKING_API_KEY) {
    // Example Twilio: const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({ body: message, from: process.env.TWILIO_PHONE, to: sellerPhone });
    // Example Africa's Talking: use their SMS API with sellerPhone and message
    console.log("[OrderNotification] Would send SMS to", sellerPhone, ":", message);
  } else {
    console.log("[OrderNotification] (No SMS config) To:", sellerPhone, "Message:", message);
  }
};

module.exports = { sendOrderNotificationToSeller };
