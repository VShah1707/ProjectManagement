import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager Learning",
      link: "https://dummy.com",
    },
  });

  const emailHTML = mailGenerator.generate(options.mailgenContent);

  const { data, error } = await resend.emails.send({
    from: "Task Manager Learning <onboarding@resend.dev>",
    to: options.email,
    subject: options.subject,
    html: emailHTML,
    // track: {
    //   opens: false,
    //   clicks: false,
    // },
  });
  if (error) {
    return console.error("Email service fails", error);
  }
  console.log("Email sent successfully", data);
};


const emailVerificationMailgenContent = (username, verificartionUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      action: {
        instuctions: "To get started with our app, please click here:",
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: verificartionUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro:
        "We received a request to reset your password. If you didn't make the request, just ignore this email. Otherwise, you can reset your password using the link below.",
      action: {
        instuctions: "To reset your password, please click here:",
        button: {
          color: "#224bbc",
          text: "Reset your password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
