import express from "express";
import healthRoute from "../routes/healthcheck.route.js";
import authRoute from "../routes/auth.routes.js";
import projectRoute from "../routes/project.routes.js";
import notesRoute from "../routes/notes.routes.js";
import taskRoute from "../routes/task.route.js";
import subTaskRoute from "../routes/subtask.route.js";
import analyticsRoute from "../routes/analytics.route.js";
import commentRoute from "../routes/comment.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "../middlewares/error.middleware.js";
import { globalLimiter, authLimiter } from "../utils/rateLimiter.js";

const app = express({ mergeParams: true });

app.set("trust proxy", 1);

//add the cors for browsers

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
//set the limit of json size that can be sended
app.use(express.json({ limit: "16kb" }));
//set the limit of data that can be send using the url
app.use(express.urlencoded({ limit: "16kb" }));

//make the content of this folder static
app.use(express.static("public"));

app.use(globalLimiter);
//middleware to access and send cookies

app.use(cookieParser());

app.use("/api/v1/healthcheck", healthRoute);
app.use("/api/v1/auth", authLimiter, authRoute);
app.use("/api/v1/project", projectRoute);
app.use("/api/v1/notes", notesRoute);
app.use("/api/v1/task", taskRoute);
app.use("/api/v1/subtask", subTaskRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/comment", commentRoute);
app.use(errorHandler);


export default app;
