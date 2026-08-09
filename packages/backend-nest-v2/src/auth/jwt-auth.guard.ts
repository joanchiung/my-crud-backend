import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { IS_PUBLIC_KEY } from './public.decorator';

interface RequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.authService.extractToken(request.headers.authorization);
    const payload = this.authService.decodeToken(token);

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('使用者不存在');
    }

    request.user = user;
    return true;
  }
}
