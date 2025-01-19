import dotenv from "dotenv";
import {app} from "./app.js";
import connectDB from "./db/mongoIndex.js";
import sequelize from "./db/sqlIndex.js";

dotenv.config({
    path: './.env'
});

connectDB().then(()=>{
    app.on("error", (error)=> {
        console.log("ERROR: ", error);
        throw error ;
    })
    sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        app.listen(process.env.PORT || 5000 , ()=>{
            console.log(`Server is running on port ${process.env.PORT || 5000}`);
        });
      
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
    
}).catch((error)=>{
    console.log("connection error: ", error);
})
