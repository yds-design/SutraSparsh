export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(
    message = "Bad request.",
    details?: unknown,
  ): ApiError {
    return new ApiError(
      400,
      "BAD_REQUEST",
      message,
      details,
    );
  }

  static unauthorized(
    message = "Unauthorized.",
    details?: unknown,
  ): ApiError {
    return new ApiError(
      401,
      "UNAUTHORIZED",
      message,
      details,
    );
  }

  static forbidden(
    message = "Forbidden.",
    details?: unknown,
  ): ApiError {
    return new ApiError(
      403,
      "FORBIDDEN",
      message,
      details,
    );
  }

  static notFound(
    message = "Resource not found.",
    details?: unknown,
  ): ApiError {
    return new ApiError(
      404,
      "NOT_FOUND",
      message,
      details,
    );
  }

  static conflict(
    message = "Conflict.",
    details?: unknown,
  ): ApiError {
    return new ApiError(
      409,
      "CONFLICT",
      message,
      details,
    );
  }

  static internal(
    message = "Internal server error.",
    details?: unknown,
  ): ApiError {
    return new ApiError(
      500,
      "INTERNAL_SERVER_ERROR",
      message,
      details,
    );
  }
}