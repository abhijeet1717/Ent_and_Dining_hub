import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { AvailabilityResponseDTO, BookingRequestDTO, MoviesSearchDto, ReviewDto } from 'src/dto/moviesearch.dto';
import { UserPreferenceReq } from 'src/proto/user/user';
import { JwtAuthGuard } from 'src/middleware/jwt.guard';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Get('')
  async getAllMovies(
    @Query('limit') limit: number,
    @Query('skip') skip: number,
  ) {
    return this.moviesService.getAllMovies(skip, limit);
  }


  @Get('movie/:movieId')
  getMovieDetails(@Param('movieId') movieId: string) {
    return this.moviesService.getMovieDetails(movieId);
  }


  //search
  @Get('search')
  searchMovies(@Query() criteria: MoviesSearchDto) {
    return this.moviesService.searchMovies(criteria);
  }  


  @Get('recommendations')
  getMovieRecommendations(@Query('userId') userId:string) {
  return this.moviesService.getMovieRecommendations(userId);
  }

  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  async makeBooking(@Body(new ValidationPipe()) bookingRequest: BookingRequestDTO,
    @Req() req
  ) {
    try {
      const userId = req.user;
      const isAvailable = await this.moviesService.checkAvailability(
        bookingRequest.movieId,
        bookingRequest.theaterId,
        bookingRequest.showtime,
        bookingRequest.numberOfTickets
      );
      
      if(isAvailable){
        const booking = await this.moviesService.makeBooking(bookingRequest,userId);
        return { message: 'Booking successful', booking };
      }
      else {
        return ({ message: 'Theater is fully booked for the specified time.' });
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
       
        
      } else {
        throw new BadRequestException('Error making booking');
      }
    }
  }

  @Get('availability')
  async checkAvailability(
    @Query('movieId') movieId: string,
    @Query('theaterId') theaterId: string,
    @Query('showtime') showtime: string,
    @Query('numberofTickets') numberofTickets: number
  ) {
    const isAvailable = await this.moviesService.checkAvailability(
      movieId,
      theaterId,
      new Date(showtime),
      numberofTickets
    );
    return new AvailabilityResponseDTO(isAvailable);
  }



  @Post('reviews/:movieId')
  @UseGuards(JwtAuthGuard)
  async submitMovieReview(
    @Param('movieId') movieId: string,
    @Body() review: ReviewDto, 
    @Req() req
  ) {
    try {
      const userId = req.user;
      const submittedReview = await this.moviesService.submitMovieReview(userId,movieId, review);
      return { message: 'Review submitted successfully', review: submittedReview };
    } catch (error) {
      throw new BadRequestException('Error submitting review');
    }
  }

  //get movie reviews
  @Get('reviews/:movieId')
  async getMovieReviews(@Param('movieId') movieId: string) {
    try {
      const reviews = await this.moviesService.getMovieReviews(movieId);
      return { reviews };
    } catch (error) {
      throw new BadRequestException('Error retrieving reviews');
    }
  }



}

