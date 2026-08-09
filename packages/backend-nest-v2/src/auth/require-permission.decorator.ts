import { Reflector } from '@nestjs/core';
import { Permission } from './permission.enum';

export const RequirePermission = Reflector.createDecorator<Permission[]>();
