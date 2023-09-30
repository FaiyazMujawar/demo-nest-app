import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class PreauthorizeGuard implements CanActivate {
  private fn: (req: Request) => boolean;
  constructor(fn: (request: Request) => boolean) {
    this.fn = fn;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    return this.fn(request);
  }
}
