import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ApiException } from './exceptions.utils';
import { Response } from 'express';

@Catch(HttpException)
export class ExceptionHandler implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = {
      message: exception.message,
      errors: [],
      timestamp: new Date(),
    };

    if (exception instanceof ApiException) {
      const ex = exception as ApiException;
      response.errors = ex.errors;
    }

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(exception.getStatus())
      .json(response);
  }
}
