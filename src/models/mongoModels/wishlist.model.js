import mongoose, {Schema} from "mongoose";

const wishlistSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            }
        }
    ]
}, {timestamps: true});

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
