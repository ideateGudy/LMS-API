import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import morgan from "morgan";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const warnFilter = winston.format((info) => {
//   return info.level === "warn" ? info : false;
// });

// const infoFilter = winston.format((info) => {
//   return info.level === "info" ? info : false;
// });

// const httpFilter = winston.format((info) =>
//   info.level === "http" ? info : false
// );

const { combine, timestamp, errors, colorize, json, splat, simple, align } =
  winston.format;

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    errors({ stack: true }),
    colorize({ all: true }),
    splat(),
    align(),
    json()
  ),
  defaultMeta: { appName: "Dive Africa REST API" },
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    }),
    new DailyRotateFile({
      filename: path.resolve(__dirname, "../../src/logs/combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "2d",
      zippedArchive: true,
      format: combine(timestamp(), json()),
    }),
    new DailyRotateFile({
      filename: path.resolve(__dirname, "../../src/logs/error-%DATE%.log"),
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxFiles: "2d",
      zippedArchive: true,
    }),
  ],
});

winston.add(
  new DailyRotateFile({
    filename: path.resolve(__dirname, "../../src/logs/exception-%DATE%.log"),
    handleExceptions: true,
    datePattern: "YYYY-MM-DD",
    maxFiles: "5d",
    zippedArchive: true,
  })
);

winston.add(
  new DailyRotateFile({
    filename: path.resolve(__dirname, "../../src/logs/rejections-%DATE%.log"),
    handleRejections: true,
    datePattern: "YYYY-MM-DD",
    maxFiles: "5d",
    zippedArchive: true,
  })
);

export const morganMiddleware = morgan(
  (tokens, req, res) => {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: parseFloat(tokens.status(req, res)),
      contentLength: tokens.res(req, res, "content-length") || 0,
      responseTime: parseFloat(tokens["response-time"](req, res)),
    };
    return JSON.stringify(logData);
  },
  {
    stream: {
      write: (message) => {
        try {
          const data = JSON.parse(message);
          logger.http("incoming-request", data);
        } catch (err) {
          logger.error("Failed to parse morgan log message", { message, err });
        }
      },
    },
  }
);
