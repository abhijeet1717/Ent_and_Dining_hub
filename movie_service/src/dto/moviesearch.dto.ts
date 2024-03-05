import { Optional } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, IsDate, IsInt, Min, Max, IsNumber } from 'class-validator';

export class MoviesSearchDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  genre?: string;

  @IsOptional()
  @IsDate()
  release_date?: Date;
}

export class ReviewDto {
  @IsNotEmpty()
  @IsString()
  movieId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  feedback: string;
}
export class AvailabilityRequestDTO {
  
  @IsString()
  restaurantId: string;
  @IsDate()
  reservationTime: Date;
}

export class AvailabilityResponseDTO {
  isAvailable: boolean;
  constructor(isAvailable: boolean) {
    this.isAvailable = isAvailable;
  }
}

export class BookingRequestDTO {
  @IsString()
  movieId: string;
  @IsString()
  theaterId: string;
  @IsString()
  showtime: Date;
  @IsNumber()
  @IsNotEmpty()
  numberOfTickets: number;
}