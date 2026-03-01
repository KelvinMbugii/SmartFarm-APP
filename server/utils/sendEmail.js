const nodemailer = require("nodemailer");

function getMissingEmailConfig() {
  const required = ["EMAIL_USER", "EMAIL_PASS"];
  return required.filter((key) => !process.env[key]);
}

async function sendEmail(to, subject, text) {
  const missingConfig = getMissingEmailConfig();
  if (missingConfig.length > 0) {
    const error = new Error(
      `Email configuration missing: ${missingConfig.join(", ")}`,
    );
    error.code = "EMAIL_CONFIG_MISSING";
    throw error;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"SmartFarm" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}



// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const message = {
//     from: process.env.EMAIL_FROM,
//     to: options.email,
//     subject: options.subject,
//     html: options.html,
//   };

//   await transporter.sendMail(message);
// };

module.exports = sendEmail;
