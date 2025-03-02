import { ApiError } from './ApiError';

export class AuthError extends ApiError {
  constructor(msg = 'Invalid username or password, please try again') {
    super(msg);
    this.code = 403;
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}
