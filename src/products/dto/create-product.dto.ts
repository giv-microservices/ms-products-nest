import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  public name: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  public description: string;

  // not required this is and optional field
  @IsOptional()
  @IsBoolean()
  public avalible?: boolean;

  @IsNumber({ maxDecimalPlaces: 4, allowInfinity: false, allowNaN: false })
  @IsPositive()
  @Min(0)
  @Type(() => Number) // if value comes from the request body as a string this will convert it to a number
  public price: number;
}
