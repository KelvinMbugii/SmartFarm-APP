const PriceAlert = require("../models/PriceAlert");
const User = require("../models/user");
const { sendSmsNotification } = require("./smsNotifications");
const sendEmail = require("./sendEmail");

const matchesCondition = ({ currentPrice, targetPrice, condition }) => {
  if (condition === "below") return currentPrice <= targetPrice;
  return currentPrice >= targetPrice;
};

const notifyPriceAlerts = async ({ commodity, price, market }) => {
  if (!commodity || typeof price !== "number") return { alerted: 0 };

  const alerts = await PriceAlert.find({
    commodity,
    isActive: true,
  }).lean();

  let alerted = 0;

  for (const alert of alerts) {
    if (
      !matchesCondition({
        currentPrice: price,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
      })
    ) {
      continue;
    }

    const user = await User.findById(alert.user).select("Phone name email").lean();
    const phoneToUse = alert.phoneNumber || user?.Phone;
    const emailToUse = alert.notifyEmail || user?.email;

    const message = `SmartFarm Alert: ${commodity} is now KES ${price} at ${market || "market"}. Your alert was set for ${alert.condition} KES ${alert.targetPrice}.`;

    let notificationSent = false;

    if (alert.notifyBySms && phoneToUse) {
      const smsSent = await sendSmsNotification({ phone: phoneToUse, message });
      if (smsSent) notificationSent = true;
    }

    if (emailToUse) {
      try {
        await sendEmail(emailToUse, `SmartFarm Price Alert: ${commodity}`, message);
        notificationSent = true;
      } catch (error) {
        console.error(`[Email] Failed to send email to ${emailToUse}:`, error.message);
      }
    }

    if (notificationSent) {
      alerted += 1;
      await PriceAlert.findByIdAndUpdate(alert._id, {
        $set: {
          lastNotifiedAt: new Date(),
          lastNotifiedPrice: price,
        },
      });
    }
  }

  return { alerted };
};

module.exports = { notifyPriceAlerts };
