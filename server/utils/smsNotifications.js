const axios = require("axios");

const normalizePhone = (phone = "") => phone.replace(/[\s-]/g, "").trim();

const sendSmsNotification = async ({ phone, message }) => {
  const cleanPhone = normalizePhone(phone);

  if (!cleanPhone || !message) return false;

  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME;

  if (!apiKey || !username) {
    console.log("[SMS] Missing Africa's Talking credentials. SMS skipped.", {
      to: cleanPhone,
      message,
    });
    return false;
  }

  try {
    const payload = new URLSearchParams({
      username,
      to: cleanPhone,
      message,
    });

    await axios.post(
      "https://api.africastalking.com/version1/messaging",
      payload.toString(),
      {
        headers: {
          apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
    );

    return true;
  } catch (error) {
    console.error(
      "[SMS] Failed to send SMS:",
      error.response?.data || error.message,
    );
    return false;
  }
};

module.exports = { sendSmsNotification };
