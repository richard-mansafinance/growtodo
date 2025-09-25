import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RequestWithUser {
  user: {
    id: string;
    roles: 'admin' | 'user';
  };
  params?: Record<string, any>;
  body?: Record<string, any>;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }

    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user found in request');
    }

    // Admin has full access
    if (user.roles === 'admin') return true;

    // If resource is user-specific, only allow if the IDs match
    const resourceUserId = String(
      request.params?.userId || request.body?.userId || '',
    );
    if (resourceUserId && user.id !== resourceUserId) {
      throw new ForbiddenException(
        'You are not allowed to access this resource',
      );
    }

    // Finally, check if the user role is in the allowed roles (optional)
    if (!requiredRoles.includes(user.roles)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
