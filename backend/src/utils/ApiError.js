class ApiError extends Error {
    constructor(
      statusCode,
      message = "Something went wrong",
      errors = [],
      stack = ""
    ) {
      super(message);
      this.statusCode = statusCode;
      this.data = null;
      this.message = message;
      this.success = false;
      this.errors = errors;
  
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  
    // Method to return the error as a JSON object
    toJSON() {
      return {
        success: this.success,
        statusCode: this.statusCode,
        message: this.message,
        errors: this.errors,
        stack: this.stack,
      };
    }
  }
  
  export { ApiError };
  