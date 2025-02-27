const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendNewEntryNotification = async (entry) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
      subject: "New Waitlist Entry - April's Lil Pugs",
      html: `
        <h2>New Waitlist Entry Received</h2>
        <p><strong>Name:</strong> ${entry.firstName} ${entry.lastName}</p>
        <p><strong>Phone Number:</strong> ${entry.phoneNumber}</p>
        <p><strong>Status:</strong> ${entry.status}</p>
        <p><strong>Notes:</strong> ${entry.notes || "None"}</p>
        <p><strong>Date Added:</strong> ${new Date().toLocaleString()}</p>
        <p>View the waitlist on the <a href="https://aprilslilpugs.com">website</a>.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email notification sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw error;
  }
};

module.exports = {
  sendNewEntryNotification,
};
