import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  errors: any[] = [];
  constructor(message: string, status: HttpStatus, errors = []) {
    super(message, status);
    this.errors = errors;
  }
}

export function notFound(message: string) {
  return new ApiException(message, HttpStatus.NOT_FOUND);
}

export function forbidden(message: string) {
  return new ApiException(message, HttpStatus.FORBIDDEN);
}
