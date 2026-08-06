const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // Your existing email service configuration stays the same
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `Event Portal <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    // FIX: Catch both 'message' (plain text) and 'html' (rich text)
    text: options.message, 
    html: options.html,    
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;