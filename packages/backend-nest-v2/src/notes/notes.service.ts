import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) // ← 告訴 NestJS：注入 Note 的 Repository
    private noteRepository: Repository<Note>, // ← 用這個變數接，型別是 Repository<Note>
  ) {}

  findAll() {
    return this.noteRepository.find();
  }
  findOne(id: number) {
    return this.noteRepository.findOneBy({ id });
  }
  create(createNoteDto: CreateNoteDto) {
    const note = this.noteRepository.create(createNoteDto); // 步驟1
    return this.noteRepository.save(note); // 步驟2
  }
  update(id: number, updateNoteDto: UpdateNoteDto) {
    return this.noteRepository.update(id, updateNoteDto);
  }

  remove(id: number) {
    return this.noteRepository.delete(id);
  }
}
