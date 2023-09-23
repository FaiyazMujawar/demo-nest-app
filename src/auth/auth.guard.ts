import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../roles/role.enum';
import { ROLES_KEY } from '../roles/roles.decorator';
import _ from 'lodash';
import { Request } from 'express';
import { User } from '../schema';

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

    if (_.isEmpty(requiredRoles)) return true;
    const request = context.switchToHttp().getRequest<Request>();
    // @ts-ignore
    const currentUser = request.user as User;
    return requiredRoles.some((role) => role === currentUser.role);
  }
}
