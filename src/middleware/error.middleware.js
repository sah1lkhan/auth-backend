import { apiError } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
  if (!(err instanceof apiError)) {
    err = new apiError(500, "failed to complete task");
  }
  const status = err.statusCode;
  return res.status(status).json({
    status: err.statusCode,
    message: err.message,
    data: err.data,
    success:err.success
  });
};

export { errorHandler };
