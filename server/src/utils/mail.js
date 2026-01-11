import Mailgen from "mailgen"; //modules makes simple for writting the html and text format for emails
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const sendMail = async (options) => {
  const emailContent = mailGenerator.generate(options.mailContent);

  const textContent = mailGenerator.generate(options.mailContent);
  try {
    const info = await transporter.sendMail({
      from: '"projekthaus" <projekthaus2@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: textContent,
      html: emailContent,
    });
  } catch (error) {
    console.log("An error had occured while sending the mail");
    console.log("Error :", error);
  }
};

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "projekthaus",
    link: "https://mailgen.js/",
  },
});

//email verification email format
const emailVerificationEmail = function (verificationUrl) {
  return {
    body: {
      name: "Projekthaus",
      intro:
        "Welcome to projekthaus! We're very excited to have you on our platform that helps you to manage your projects with ease.",
      action: {
        instructions: "To verify your email please, please click here:",
        button: {
          color: "#22BC66",
          text: "verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

//reset password email format
const resetPasswordEmail = function (url) {
  return {
    body: {
      name: "Projekthaus",
      intro:
        "You have received this email because a password reset request for your account was received.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#DC4D2F",
          text: "Reset your password",
          link: url,
        },
      },
      outro:
        "If you did not request a password reset, no further action is required on your part.",
    },
  };
};

//add member to the project

const addMemberEmail = function (projectName, url) {
  return {
    body: {
      name: projectName,
      intro:
        "we are very happy to annouce you that you are going to part of our project.",
      action: {
        instructions: "Click the button below to join the project:",
        button: {
          color: "#0048ffff",
          text: "join the project",
          link: url,
        },
      },
      outro:
        "If you did not want to join, no further action is required on your part.",
    },
  };
};

//project assigned email
const assignedEmail = function (projectName, typeOfTask, nameOfTask, url) {
  return {
    body: {
      // You can replace "Team Member" with a specific user name if you add it as a parameter
      name: "Team Member",
      intro: [
        `You have been assigned a new ${typeOfTask}: "${nameOfTask}"`,
        `Project: **${projectName}**`,
      ],
      action: {
        instructions:
          "To view the task details and get started, please click the button below:",
        button: {
          color: "#0048ffff",
          text: "View Assigned Task",
          link: url,
        },
      },
      outro: [
        "Please ensure you review the task requirements and deadlines.",
        "If you have any questions, feel free to reply to this email or contact your project manager.",
      ],
    },
  };
};
//work to be done here

export {
  assignedEmail,
  addMemberEmail,
  emailVerificationEmail,
  resetPasswordEmail,
  sendMail,
};
