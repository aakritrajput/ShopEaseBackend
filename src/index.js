import dotenv from "dotenv";
import {app} from "./app.js";
import connectDB from "./db/mongoIndex.js";

dotenv.config({
    path: './.env'
});

connectDB().then(()=>{
    app.on("error", (error)=> {
        console.log("ERROR: ", error);
        throw error ;
    })
    app.listen(process.env.PORT || 5000 , ()=>{
        console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
}).catch((error)=>{
    console.log("MONGO db connection error: ", error);
})
