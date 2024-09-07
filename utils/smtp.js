const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, otp) => {
  try {
    // Connect with SMTP server
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use true for port 465, false for other ports
      auth: {
        user: "saadameen810@gmail.com", // Your Gmail address
        pass: "xtxo zqhx yhpo bvrg", // Your Gmail App Password
      },
    });

    // Create a visually interactive HTML email template
    const html = `
      <html>
        <head>
          <style>
            /* Your styles here */
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Syntho Next</h1>
            </div>
            <div class="content">
              <h2>Your OTP Code</h2>
              <p>Hi there,</p>
              <p>Thank you for registering. Please use the following OTP to verify your account:</p>
              <div class="otp">${otp}</div>
              <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
            </div>
            <div class="footer">
              <p>© 2024 Syntho Next. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Syntho Next 👻" <your-email@gmail.com>', // Your Gmail address
      to: email,
      subject: subject,
      text: `Your OTP is ${otp}`, // Fallback text for clients that do not support HTML
      html: html,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return info.messageId ? true : false;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
};

module.exports = sendEmail;
