export interface ApiErrorInterface extends Error {
  statusCode: number;
}

export default class ApiError extends Error {
  private statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);

    this.name = "ApiError";

    this.statusCode = statusCode;
  }
}
