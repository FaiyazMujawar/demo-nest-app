import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // @ts-ignore
    return request.user;
  },
);
