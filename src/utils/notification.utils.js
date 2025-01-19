import { Notification } from "../models/mongoModels/notification.model.js";
import ApiError from "./ApiError.utils.js";
import sendEmail from "../services/email.service.js";
import sendSms from "../services/sms.service.js";

const sendNotification = async ({userId, type, to, body, subject='Email from shopEase'}) => {
    try {
        if (type === 'critical'){
            await sendSms({to, body});
            console.log("sms sent successfully")
            await Notification.create({
                userId,
                message: body,
                type,
            })
            console.log("critical notification saved to database !!")
        }else if( type === 'promotional' || type === 'info'){
            await sendEmail({to, body, subject})
            console.log("email sent successfully !")
        }
    } catch (error) {
        console.log("error sending notification: ", error);
        throw new ApiError(error.statusCode || 500 , error.message || " Error sending notification")
    }
}

const getNotifications = async (userId) => {
    try {
        const notifications = await Notification.find({ userId })
            .sort({ timestamp: -1 }); // Sorting by latest first
        return notifications;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw new ApiError(error.statusCode || 500 , error.message || " Error getting notification")
    }
};

const markAsRead = async (notificationId) => {
    try {
        const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        return notification;
    } catch (error) {
        console.error("Error marking notification as seen:", error);
        throw new ApiError(error.statusCode || 500 , error.message || " Error changing notification seen status")
    }
};

export {
    sendNotification,
    getNotifications,
    markAsRead
}