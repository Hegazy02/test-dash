import { NextApiRequest, NextApiResponse } from "next";
import winston from "winston";

const logger = winston.createLogger({
  level: "error",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log" }),
  ],
});

export function errorHandler(
  err: any,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  logger.error(err.stack || err.message);
  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({
    error: isDev ? err.message : "حدث خطأ غير متوقع، حاول لاحقًا.",
  });
}
