import { Controller, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';
import { RequirePermission } from '../auth/require-permission.decorator';
import { Permission } from '../auth/permission.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/permissions')
  @RequirePermission([Permission.UsersManagePermissions])
  updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserPermissionsDto,
  ) {
    return this.usersService.updatePermissions(id, dto.permissions);
  }
}
