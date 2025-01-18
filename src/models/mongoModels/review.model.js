import mongoose, {Schema} from "mongoose";

const reviewSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
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

