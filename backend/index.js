import app from "./src/app.js";
import dotenv from 'dotenv'

import connectDB from "./src/databaseConfig/dbConnect.js";

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT


//database
connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running at ${PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongodb database error",err);
    
})


