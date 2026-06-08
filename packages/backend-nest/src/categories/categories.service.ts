import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const category = await this.repo.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    try {
      const category = this.repo.create(dto);
      return await this.repo.save(category);
    } catch (err) {
      if ((err as { code?: string }).code === '23505')
        throw new ConflictException('Category name already exists');
      throw err;
    }
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    try {
      return await this.repo.save(category);
    } catch (err) {
      if ((err as { code?: string }).code === '23505')
        throw new ConflictException('Category name already exists');
      throw err;
    }
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.repo.remove(category);
    return { message: 'Category deleted successfully' };
  }
}
