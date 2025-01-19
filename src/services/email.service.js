import nodemailer from "nodemailer";
import  ApiError  from "../utils/ApiError.utils.js";

const sendEmail = async ({to, subject, body}) => {
    try {
        const transporter = nodemailer.createTransport({
          service: "gmail", 
          auth: {
            user: process.env.PROJECT_OWNER_EMAIL, 
            pass: process.env.PROJECT_OWNER_PASSWORD, 
          }
        });
    
        const mailOptions = {
          from: `"ShopEase" <${process.env.PROJECT_OWNER_EMAIL}>`, 
          to, 
          subject,
          text: body,
        };
  
        await transporter.sendMail(mailOptions);
    
        console.log("Email sent successfully to:", email);
      } catch (error) {
        console.log("Failed to send Email:", error.message);
        throw new ApiError(error.statusCode || 500, error.message || "Email sending failed. Please try again.");
      }
};

export default sendEmail;