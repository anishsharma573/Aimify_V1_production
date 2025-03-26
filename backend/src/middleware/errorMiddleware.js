const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || [];
  
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  };
  
  export default errorMiddleware;