import express from "express";
import dotenv from "dotenv";

dotenv.config({
    path:"./.env"
});

const app = express();

const PORT = process.env.PORT;

app.get("/projekthaus",(req,res)=>{
    res.status(200).json("The server is working");
})

app.listen(PORT||3000,()=>{
    console.log(`The server is listning at the port ${PORT}`);
}
);