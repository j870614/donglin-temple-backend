import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import path from "path";
// import passport from "passport";

import swaggerFile from "../swagger-output.json";

import { indexRouter } from "./routes/index.route";
import { managersRouter } from "./routes/managers.route";
import { usersRouter } from "./routes/users.route";
import { guestsRouter } from "./routes/guests.route";
import { handleError } from "./utils/handleError";
import { handleNotFoundError } from "./utils/handleNotFoundError";
import "./controllers/managers.controller";
// import { RegisterRoutes } from "./routes";

// **** Variables **** //
const API_BASEURL = "/api";
const API_MANAGERS_ENDPOINT = `${API_BASEURL}/managers`;
const API_USERS_ENDPOINT = `${API_BASEURL}/users`;
const API_GUESTS_ENDPOINT = `${API_BASEURL}/guests`;
const app = express();

// **** Process Error handler **** //

// Record error and stop this process while the service is done.
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception!");
  console.error(err);
  process.exit(1);
});

// Uncaught catch
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection: ", promise, "reason: ", reason);
});

// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
// app.use(passport.initialize());
// app.use(passport.session());

// Show routes called in console during development
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}
/* eslint-disable */
// app.use((req: any, res: any, next: any) => {
//   req.stringValue = "fancyStringForContext";
//   next();
// });

// RegisterRoutes(app);

// Add APIs, must be after middleware
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(API_BASEURL, indexRouter);
app.use(API_MANAGERS_ENDPOINT, managersRouter);
app.use(API_USERS_ENDPOINT, usersRouter);
app.use(API_GUESTS_ENDPOINT, guestsRouter);

// Add error handlers
app.use(handleNotFoundError);
app.use(handleError);

// ** Front-End Content ** //

// Set static directory (js and css)
app.use(express.static(path.join(__dirname, "public")));

// Set views directory (html)
app.set("views", path.join(__dirname, "views"));

export { app };
