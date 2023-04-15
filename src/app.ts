import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

import { indexRouter } from "./routes/index";
import { usersRouter } from "./routes/users";
import { handleError } from "./utils/handleError";
import { handleNotFoundError } from "./utils/handleNotFoundError";

// **** Variables **** //

/**
 * API setting example
 * process.env.API_BASEURL = "/api"
 * process.env.API_USER_ENDPOINT = "/users"
 * API_USERS_ENDPOINT = /api/users
 */
const API_BASEURL = String(process.env.API_BASEURL);
const API_USERS_ENDPOINT = API_BASEURL + String(process.env.API_USER_ENDPOINT);

const app = express();

// **** Process Error handler **** //

// Record error and stop this process while the service is done.
process.on("uncaughtException", (err) => {
  console.error("Uncaughted Exception!");
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

// Show routes called in console during development
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

// Add APIs, must be after middleware
app.use(API_BASEURL, indexRouter);
app.use(API_USERS_ENDPOINT, usersRouter);

// Add error handlers
app.use(handleNotFoundError);
app.use(handleError);

// ** Front-End Content ** //

// Set static directory (js and css)
app.use(express.static(path.join(__dirname, "public")));

// Set views directory (html)
app.set("views", path.join(__dirname, "views"));

export { app };
