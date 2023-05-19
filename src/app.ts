import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import path from "path";
// import passport from "passport";

import swaggerDocument from "../swagger.json";

import { indexRouter } from "./routes/index.route";
import { usersRouter } from "./routes/users.route";
import { handleError } from "./utils/handleError";
import { handleNotFoundError } from "./utils/handleNotFoundError";
import { parseTsoaRequest } from "./utils/parseTsoaRequest";
import { RegisterRoutes } from "./routes";
import { handleTsoaNotFoundError } from "./utils/handleTsoaNotFoundError";
import { handleTsoaError } from "./utils/handleTsoaError";

// **** Variables **** //
const API_BASEURL = "/api";
const API_USERS_ENDPOINT = `${API_BASEURL}/users`;
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

app.use(parseTsoaRequest);

RegisterRoutes(app);

// Add APIs, must be after middleware
app.use(
  ["/api-doc", "/doc", "/swagger"],
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);
app.use(API_BASEURL, indexRouter);
app.use(API_USERS_ENDPOINT, usersRouter);

// Add error handlers
app.use(handleTsoaNotFoundError);
app.use(handleTsoaError);
app.use(handleNotFoundError);
app.use(handleError);

// ** Front-End Content ** //

// Set static directory (js and css)
app.use(express.static(path.join(__dirname, "public")));

// Set views directory (html)
app.set("views", path.join(__dirname, "views"));

export { app };
