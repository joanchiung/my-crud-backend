import { IsArray, IsEnum } from 'class-validator';
import { Permission } from '../../auth/permission.enum';

export class UpdateUserPermissionsDto {
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions!: Permission[];
}
