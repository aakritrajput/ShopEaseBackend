import twilio from "twilio";
import ApiError from "../utils/ApiError.utils";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendSms = async ({to, body}) => {
    try {
        const message = await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log('Message sent:', message.sid);
    } catch (error) {
        console.log('Failed to send SMS:', error.message);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to send SMS. Please try again.");
    }
}

export default sendSms;