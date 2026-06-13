import rateLimit from "express-rate-limit";
import { ApiResponse } from "./api-response.js";

const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // in 10 minutes allow only 200 requests
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // executes when limit of a an ip address is reached
    res
      .status(429)
      .json(
        new ApiResponse(
          429,
          null,
          "Too many requests. Please try again later.",
        ),
      );
  },
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res
      .status(429)
      .json(
        new ApiResponse(429, null, "Too many requests. Please apply later."),
      );
  },
});

export { globalLimiter, authLimiter };
