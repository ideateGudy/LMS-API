import winston from "winston";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const warnFilter = winston.format((info, opts) => {
  return info.level === "warn" ? info : false; //TODO: NOT WORKING YET
});

const infoFilter = winston.format((info, opts) => {
  return info.level === "info" ? info : false; //TODO: NOT WORKING YET
});

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
  defaultMeta: { type: "REST API" },
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    }),
    new winston.transports.File({
      filename: path.resolve(__dirname, "../../src/logs/combined.log"),
      format: combine(timestamp(), json()),
    }),
    new winston.transports.File({
      filename: path.resolve(__dirname, "../../src/logs/error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.resolve(__dirname, "../../src/logs/warn.log"),
      level: "warn",
      format: combine(warnFilter(), timestamp(), json()),
    }),
    new winston.transports.File({
      filename: path.resolve(__dirname, "../../src/logs/info.log"),
      level: "info",
      format: combine(infoFilter(), timestamp(), json()),
    }),
  ],
});

// winston.add(
//   new winston.transports.Console({
//     format: combine(colorize(), simple()),
//   })
// );

winston.add(
  new winston.transports.File({
    filename: path.resolve(__dirname, "../../src/logs/exception.log"),
    handleExceptions: true,
  })
);

winston.add(
  new winston.transports.File({
    filename: path.resolve(__dirname, "../../src/logs/rejections.log"),
    handleRejections: true,
  })
);
