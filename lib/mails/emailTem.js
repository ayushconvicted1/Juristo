// mailController.js
import { SendMailClient } from "zeptomail";

const url = "api.zeptomail.com/";
const token = process.env.ZEPTO_MAIL_API_KEY;
const client = new SendMailClient({ url, token });

export const sendUsageNotificationEmail = async (usage, recipientEmail) => {
  try {
    const response = await client.sendMail({
      from: {
        address: "noreply@juristo.in", // Must be a verified sender in ZeptoMail
        name: "Juristo Notification",
      },
      to: [
        {
          email_address: {
            address: recipientEmail,
            name: recipientEmail.split("@")[0],
          },
        },
      ],
      subject:
        usage === "100%"
          ? "100% Usage Reached – Upgrade Required"
          : "50% Usage Reached",
      htmlbody:
        usage === "100%"
          ? `<div>
             <p>Dear User,</p>
             <p>You have reached 100% usage of your document drafts. Please upgrade to our premium plan to continue using the service.</p>
             <p>Thank you,<br/>Juristo Team</p>
           </div>`
          : `<div>
             <p>Dear User,</p>
             <p>You have reached 50% usage of your document drafts.</p>
             <p>Thank you,<br/>Juristo Team</p>
           </div>`,
    });
    console.log("Usage email sent successfully:", response);
  } catch (error) {
    console.error("Error sending usage email:", error);
    throw error;
  }
};
