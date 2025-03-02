import { ApiError } from './ApiError';

export class InputError extends ApiError {
  constructor(msg: string) {
    super(msg);
    this.code = 400;
    Object.setPrototypeOf(this, InputError.prototype);
  }
}
