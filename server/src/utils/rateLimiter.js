import rateLimit from "express-rate-limit";
import { ApiResponse } from "./api-response";

const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // in 10 minutes allow only 200 requests
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // executes when limit of a an ip address is reached
    res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Too many requests. Please try again later.",
        ),
      );
  },
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res
      .status(400)
      .json(
        new ApiResponse(400, null, "Too many requests. Please apply later."),
      );
  },
});

export { globalLimiter, authLimiter };
