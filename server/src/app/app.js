import express from "express";
import healthRoute from "../routes/healthcheck.route.js";

const app = express();

//set the limit of json size that can be sended
app.use(express.json({limit:"16kb"}));
//set the limit of data that can be send using the url
app.use(express.urlencoded({limit:"16kb"}));

//make the content of this folder static
app.use(express.static("public"));


app.use("/api/v1/healthcheck", healthRoute);
export default app;
