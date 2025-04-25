import winston from "winston";
import morgan from "morgan";
import { fileURLToPath } from "url";
import path from "path";
import { Request, Response } from 'express'; // For morgan type definitions

// Type definitions for Morgan log data
interface MorganLogData {
  method: string;
  url: string;
  status: number;
  contentLength: string;
  responseTime: number;
}

// Convert file URL to path (ESM compatibility)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combine, timestamp, errors, colorize, json, splat, simple, align } = winston.format;

// Create logger with type-safe configuration
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
  defaultMeta: { service: "REST API" }, // Changed 'type' to more standard 'service'
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
      format: combine(timestamp(), json()),
    }),
  ],
  // Exception handling configuration
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.resolve(__dirname, "../../src/logs/exception.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.resolve(__dirname, "../../src/logs/rejections.log"),
    }),
  ],
});

// Morgan middleware with type-safe stream handler
export const morganMiddleware = morgan(
  (tokens, req: Request, res: Response) => {
    const logData: MorganLogData = {
      method: tokens.method(req, res) || '',
      url: tokens.url(req, res) || '',
      status: Number(tokens.status(req, res)) || 0,
      contentLength: tokens.res(req, res, 'content-length') || '0',
      responseTime: Number(tokens['response-time'](req, res)) || 0,
    };
    return JSON.stringify(logData);
  },
  {
    stream: {
      write: (message: string) => {
        try {
          const data: MorganLogData = JSON.parse(message);
          logger.http("incoming-request", data);
        } catch (err) {
          if (err instanceof Error) {
            logger.error("Failed to parse morgan log message", { 
              message, 
              error: err.message 
            });
          }
        }
      },
    },
  }
);

// Type augmentation for logger methods
declare module 'winston' {
  interface Logger {
    http: winston.LeveledLogMethod;
  }
}