import { Controller, Post, Body, Param, Get, UseGuards, UnauthorizedException, OnModuleInit, Req, Query, Put, Res, NotFoundException, InternalServerErrorException, ValidationPipe } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { JwtAuthGuard } from 'src/middleware/jwt.guard';
import { AvailabilityResponseDTO, ReservationRequestDTO, ReservationResponseDTO } from './dto/restaurant.dto';
import { Restaurant } from './entity/restaurant.entity';

@Controller('restaurants')
export class ReservationController {
  constructor(private readonly restaurantService: RestaurantService) { }

  //get all restaurants
  @Get()
  async getRestaurants() {
    const restaurants = await this.restaurantService.getRestaurants();
    return restaurants;
  }

  //get nearby restaurants
  @Get('nearby')
  async getNearbyRestaurants(@Query('latitude') latitude: string, @Query('longitude') longitude: string,) {
    const location = { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] };
    // console.log(location);
    const nearbyRestaurants = await this.restaurantService.getNearbyRestaurants(location);
    return nearbyRestaurants;
  }

  //get restaurant by Id
  @Get('restaurantId/:restaurantId')
  async getRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.restaurantService.getRestaurant(restaurantId);
  }

  @Put('restaurantId/:restaurantId')
  async updateRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Body() updatedRestaurant: Restaurant,
  ) {
    return this.restaurantService.updateRestaurant(restaurantId, updatedRestaurant);
  }

  //reserve restaurant
  @Post('reserve')
  @UseGuards(JwtAuthGuard)
  async createReservation(@Body(new ValidationPipe()) reservationRequest: ReservationRequestDTO, @Req() req, @Res() res) {
    const userId = req.user;
    try {
      const isAvailable = await this.restaurantService.checkAvailability(
        reservationRequest.restaurantId,
        reservationRequest.reservationTime,
        reservationRequest.numberOfGuests
      );

      if (isAvailable) {
        const reservation = await this.restaurantService.createReservation(reservationRequest, userId);
        return res.status(201).json(new ReservationResponseDTO(reservation));
      } else {
        return res.status(400).json({ message: 'Restaurant is fully booked for the specified time.' });
      }
    } catch (error) {
      if (error.message === 'Invalid restaurantId') {
        return res.status(400).json({ message: 'Invalid restaurantId' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  //checking availabiliy of restaurant
  @Get('availability')
  async checkAvailability(
    @Query('restaurantId') restaurantId: string,
    @Query('reservationTime') reservationTime: string,
    @Query('numberOfGuests') numberOfGuests: number
  ) {
    const isAvailable = await this.restaurantService.checkAvailability(
      restaurantId,
      new Date(reservationTime),
      numberOfGuests
    );
    return new AvailabilityResponseDTO(isAvailable);
  }


  @Get('info')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Req() req) {
    const userId = req.user;
    return this.restaurantService.getUserReservationInfo(userId);
  }

  //place food order
  @Post('place-order')
  @UseGuards(JwtAuthGuard)
  async placeFoodDeliveryOrder(
    @Body('restaurantId') restaurantId: string,
    @Body('orderRequest') orderRequest: any,
    @Req() req
  ) {
    const userId = req.user;
    try {
      const orderResult = await this.restaurantService.placeFoodDeliveryOrder(restaurantId, orderRequest, userId);
      if (orderResult.message) {
        return { statusCode: 200, message: orderResult };
      }
      return { statusCode: 404, message: "Something went wrong" };
    } catch (error) {
      return { statusCode: 500, message: 'Internal Server Error' };
    }
  }


  @Get('getMyOrders')
  @UseGuards(JwtAuthGuard)
  async getAllOrders(@Query('restaurantId') restaurantId: string, @Req() req) {
    try {
      const userId = req.user;
      const orders = await this.restaurantService.getUserOrders(userId, restaurantId);
      return { orders };
    } catch (error) {
      console.error(error);
      return { message: 'Internal Server Error' };
    }
  }

  @Get('order/:orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    try {
      const orderInfo = await this.restaurantService.getOrderById(orderId);

      if (!orderInfo) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }
      return { orderInfo };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  @Get('orderInfo')
  @UseGuards(JwtAuthGuard)
  async getUserOrderInfo(@Req() req) {
    const userId = req.user;
    return this.restaurantService.getUserOrderInfo(userId);
  }

}