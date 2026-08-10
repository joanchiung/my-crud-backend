import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { User } from '../users/user.entity';
import { Permission } from '../auth/permission.enum';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) // ← 告訴 NestJS：注入 Note 的 Repository
    private noteRepository: Repository<Note>, // ← 用這個變數接，型別是 Repository<Note>
  ) {}

  findAll(user: User) {
    if (user.permissions.includes(Permission.NotesReadAll)) {
      return this.noteRepository.find();
    }
    return this.noteRepository.find({ where: { ownerId: user.id } });
  }

  async findOne(id: number, user: User) {
    const note = await this.noteRepository.findOneBy({ id });
    if (!note) {
      return null;
    }

    const canReadAll = user.permissions.includes(Permission.NotesReadAll);
    if (!canReadAll && note.ownerId !== user.id) {
      throw new ForbiddenException('無法讀取其他使用者的 note');
    }
    return note;
  }

  create(createNoteDto: CreateNoteDto, user: User) {
    const note = this.noteRepository.create({
      ...createNoteDto,
      ownerId: user.id,
    });
    return this.noteRepository.save(note);
  }

  async update(id: number, updateNoteDto: UpdateNoteDto, user: User) {
    const note = await this.findOwnedNoteOrThrow(id, user);
    return this.noteRepository.update(note.id, updateNoteDto);
  }

  async remove(id: number, user: User) {
    const note = await this.findOwnedNoteOrThrow(id, user);
    return this.noteRepository.delete(note.id);
  }

  // update/remove 一律要求本人擁有，不受 notes:read-all 影響（見設計筆記：寫入/刪除保持純 ownership）
  private async findOwnedNoteOrThrow(id: number, user: User): Promise<Note> {
    const note = await this.noteRepository.findOneBy({ id });
    if (!note) {
      throw new NotFoundException('note 不存在');
    }
    if (note.ownerId !== user.id) {
      throw new ForbiddenException('無法操作其他使用者的 note');
    }
    return note;
  }
}
