import { Priority } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Data transfer object for creating a new task.
 */
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsISO8601()
  @IsOptional()
  @Transform(({ value }: { value: string | null | undefined }) =>
    value ? new Date(value) : value,
  )
  dueDate?: Date;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}
