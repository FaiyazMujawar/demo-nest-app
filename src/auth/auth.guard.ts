import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { Role } from '../roles/role.enum';
import { ROLES_KEY } from '../roles/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isEmpty(requiredRoles)) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const currentUser = request.user;
    const currentMarket = request.market;

    return (
      currentUser.superadmin ||
      requiredRoles.some((role) => role === currentUser.markets[currentMarket])
    );
  }
}
