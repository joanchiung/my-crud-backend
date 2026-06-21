import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Todo } from './todo.entity.js';
import { Category } from '../categories/category.entity.js';
import { User } from '../users/user.entity.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo) private readonly todoRepo: Repository<Todo>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  findAll() {
    return this.todoRepo.find({
      relations: { categories: true, user: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const todo = await this.todoRepo.findOne({
      where: { id },
      relations: { categories: true, user: true },
    });
    if (!todo) throw new NotFoundException('Todo not found');
    return todo;
  }

  async create(dto: CreateTodoDto) {
    const { categoryIds, userId, ...rest } = dto;
    const todo = this.todoRepo.create(rest);
    todo.categories = categoryIds?.length
      ? await this.categoryRepo.findBy({ id: In(categoryIds) })
      : [];
    todo.user = await this.userRepo.findOneByOrFail({ id: userId });
    return this.todoRepo.save(todo);
  }

  async update(id: number, dto: UpdateTodoDto) {
    const todo = await this.findOne(id);
    const { categoryIds, userId, ...rest } = dto;
    Object.assign(todo, rest);
    if (categoryIds !== undefined) {
      todo.categories = categoryIds.length
        ? await this.categoryRepo.findBy({ id: In(categoryIds) })
        : [];
    }
    if (userId !== undefined) {
      todo.user = await this.userRepo.findOneByOrFail({ id: userId });
    }
    return this.todoRepo.save(todo);
  }

  async remove(id: number) {
    const todo = await this.findOne(id);
    await this.todoRepo.remove(todo);
    return { message: 'Todo deleted successfully' };
  }
}
