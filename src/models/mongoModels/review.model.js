import mongoose, {Schema} from "mongoose";

const reviewSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String
    }
});

export const Review = mongoose.model("Review", reviewSchema);

