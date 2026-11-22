export class AppError extends Error {
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
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
    this.statusCode =
      Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
        ? statusCode
        : 500;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(TaskPriorityChangeEvent, new.target);
  }
}
