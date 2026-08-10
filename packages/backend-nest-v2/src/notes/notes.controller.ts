import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { RequirePermission } from '../auth/require-permission.decorator';
import { Permission } from '../auth/permission.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @RequirePermission([Permission.NotesRead])
  findAll(@CurrentUser() user: User) {
    return this.notesService.findAll(user);
  }

  @Get(':id')
  @RequirePermission([Permission.NotesRead])
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.notesService.findOne(id, user);
  }

  @Post()
  @RequirePermission([Permission.NotesCreate])
  create(@Body() dto: CreateNoteDto, @CurrentUser() user: User) {
    return this.notesService.create(dto, user);
  }

  @Patch(':id')
  @RequirePermission([Permission.NotesUpdate])
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNoteDto,
    @CurrentUser() user: User,
  ) {
    return this.notesService.update(id, dto, user);
  }

  @Delete(':id')
  @RequirePermission([Permission.NotesDelete])
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.notesService.remove(id, user);
  }
}
