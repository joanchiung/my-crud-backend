import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/user.entity';

interface RequestWithUser extends Request {
  user?: User;
}

// 只用在已經過 JwtAuthGuard 的路由上，此時 request.user 保證已存在
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user as User;
  },
);
