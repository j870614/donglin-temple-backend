import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { indexRouter } from "./routes/index";
import { usersRouter } from "./routes/users";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "../", "views"));

app.use("/", indexRouter);
app.use("/users", usersRouter);

export { app };
