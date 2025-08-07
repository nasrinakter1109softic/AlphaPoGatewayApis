import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GenericQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsString()
  orderDir?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Date)
  dateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  dateTo?: Date;

  // any other filters (dynamic)
  @Transform(({ value }) => JSON.parse(value))
  @IsOptional()
  filters?: any;
}
