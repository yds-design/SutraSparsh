import winston from "winston";

export const logger = winston.createLogger({
  level: "debug",

  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()} : ${message}`;
    })
  ),

  transports: [
    new winston.transports.Console(),

    new winston.transports.File({
      filename: "logs/importer.log",
    }),

    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
  ],
});