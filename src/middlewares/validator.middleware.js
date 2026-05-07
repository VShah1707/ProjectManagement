import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiErrors.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extracted = [];
  errors.array().map((err) => extracted.push({ [err.path]: err.msg }));
  return res.status(422).json(new ApiError(422, "Received data is not valid", extracted))
};
