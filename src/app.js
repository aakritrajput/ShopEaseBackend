import express from "express" ;
import cookieParser from "cookie-parser";
import cors from "cors";
import {sequelize} from "./models/sqlModels/index.js";

const app = express();

(async () => {
    try {
        await sequelize.sync({ force: false }); // false to prevent table recreation
        console.log('Database synced successfully!');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
})();

// importing routes 

import userRoutes from "./routes/user.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import reviewRoutes from "./routes/review.routes.js"
import wishlistRoutes from "./routes/wishlist.routes.js"
import productRoutes from "./routes/product.routes.js"
import categoryRoutes from "./routes/category.routes.js"
import orderRoutes from "./routes/order.routes.js"

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({extended: true, limit: "25kb"}))
app.use(express.static("public"));
app.use(cookieParser());

// decclaring routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/order", orderRoutes);

export {app};