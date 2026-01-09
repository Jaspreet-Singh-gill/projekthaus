import express from "express";
import healthRoute from "../routes/healthcheck.route.js";

const app = express();
app.use("/api/v1/healthcheck", healthRoute);
export default app;
