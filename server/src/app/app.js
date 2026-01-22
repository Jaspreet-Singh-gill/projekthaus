import express from "express";
import healthRoute from "../routes/healthcheck.route.js";
import authRoute from "../routes/auth.routes.js";
import projectRoute from "../routes/project.routes.js";
import notesRoute from "../routes/notes.routes.js";
import taskRoute from "../routes/task.route.js";
import subTaskRoute from "../routes/subtask.route.js";
import cookieParser from "cookie-parser";

const app = express({ mergeParams: true });

//set the limit of json size that can be sended
app.use(express.json({ limit: "16kb" }));
//set the limit of data that can be send using the url
app.use(express.urlencoded({ limit: "16kb" }));

//make the content of this folder static
app.use(express.static("public"));

//middleware to access and send cookies

app.use(cookieParser());

app.use("/api/v1/healthcheck", healthRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/project", projectRoute);
app.use("/api/v1/notes", notesRoute);
app.use("/api/v1/task", taskRoute);
app.use("/api/v1/subtask", subTaskRoute);

export default app;
