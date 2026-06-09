import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Work', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ required: false, example: '#3b82f6', maxLength: 7 })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
