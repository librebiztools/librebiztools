export class ApiError extends Error {
  /**
   * HTTP Status Code of Error
   */
  code: number;

  constructor(msg: string = 'An unknown error has occured') {
    super(msg);
    this.code = 500;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
