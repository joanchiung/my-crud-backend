import { IsString, IsOptional } from 'class-validator';
export class CreateNoteDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
