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

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({extended: true, limit: "25kb"}))
app.use(express.static("public"));
app.use(cookieParser());

export {app};