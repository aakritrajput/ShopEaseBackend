import mongoose, {Schema} from "mongoose";

const wishlistSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: {
        type: [String]
    } 
}, {timestamps: true});

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
