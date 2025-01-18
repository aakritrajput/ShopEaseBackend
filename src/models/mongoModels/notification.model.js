import mongoose, {Schema} from "mongoose";

const notificationSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    type: { 
        type: String, 
        enum: ["critical", "promotional", "info"], 
        required: true 
    }
}, {timestamps: true});

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); //30 days

export const Notification = mongoose.model("Notification", notificationSchema);
