import dotenv from "dotenv";
import app from "./app/app.js"



dotenv.config({
    path:"./.env"
});


const PORT = process.env.PORT;


app.listen(PORT||3000,()=>{
    console.log(`The server is listning at the port ${PORT}`);
}
);