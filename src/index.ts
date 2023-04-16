/**
 * Module dependencies.
 */

import debug from "debug";
import http from "http";
import path from "path";
import "dotenv/config";

import { app } from "./app.js";

/**
 * Create interface to handle http error.
 */

export interface HttpErrorException extends Error {
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}

/**
 * Get port from environment and store in Express.
 */

const port = path.normalize(String(process.env.API_PORT) || "3000");
const env = String(process.env.NODE_ENV);
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: HttpErrorException) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = `Pipe ${port}`;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind =
    typeof addr === "string"
      ? `pipe ${addr}`
      : `port ${addr?.port ?? "unknown"}`;
  debug(`Listening on ${bind}`);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => {
  console.log(`Server started on port: ${port}, env: ${env}`);
});
server.on("error", onError);
server.on("listening", onListening);
