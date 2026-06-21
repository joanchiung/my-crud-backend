import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ required: false, example: 'Joan' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'joan@example.com' })
  @IsString()
  email!: string;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive', 'invited'] })
  @IsString()
  status!: string;
}
