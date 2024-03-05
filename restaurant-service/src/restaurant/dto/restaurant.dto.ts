import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Reservation } from "src/restaurant/entity/reservation.entity";

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

export class ReservationRequestDTO {
  @IsString()
  restaurantId: string;
  @IsString()
  reservationTime: Date;
  @IsNumber()
  @IsNotEmpty()
  numberOfGuests: number;
}

export class ReservationResponseDTO {
  reservation: Reservation;
  constructor(reservation: Reservation) {
    this.reservation = reservation;
  }
}

export class OrderRequestDTO {
  restaurantId
}


