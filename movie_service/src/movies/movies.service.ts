import { BadRequestException, Injectable, NotFoundException, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Movies } from 'src/entity/movie.entity';
import { ObjectId } from 'mongodb';
import { BookingRequestDTO, MoviesSearchDto, ReviewDto } from '../dto/moviesearch.dto'
import { UserPreferenceRes } from 'src/proto/user/user';
import { AuthService } from 'src/middleware/auth.service';
import { Theater } from 'src/entity/theater.entity';
import { Booking, BookingStatus } from 'src/entity/booking.entity';
import { Review } from 'src/entity/reviews.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { Subscription } from 'src/subscriptions/entity/subscriptions';


@Injectable()
export class MoviesService {
  constructor(@InjectModel(Movies.name) private movieModel: Model<Movies>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Theater.name) private theaterModel: Model<Theater>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
    private readonly service: AuthService,
  ) { }

  async getAllMovies(skip: number, limit: number) {
    try {
      const count = await this.movieModel.countDocuments({});
      const pageTotal = Math.ceil(count / limit);
      const currentPage = Math.floor(skip / limit) + 1;
     
      const data = await this.movieModel.find().limit(limit).skip(skip).exec();

      return {
        data: data,
        currentPage: currentPage,
        page_total: pageTotal,
        status: 200,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getMovieDetails(movieId: string) {
    if (!Types.ObjectId.isValid(movieId)) {
      throw new NotFoundException('Invalid movieId');
    }
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(movieId)
        }
      },
      {
        $lookup: {
          from: "theaters",
          let: { movieId: "$_id" },
          pipeline: [
            {
              $unwind: "$movie_showtimes"
            },
            {
              $match: {
                $expr: {
                  $eq: [{ $toObjectId: "$movie_showtimes.movie_id" }, "$$movieId"]
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                address: 1,
                showtime: "$movie_showtimes.showtime",
                average_rating: 1
              }
            }
          ],
          as: "theaters"
        }
      }
    ]

    const movieDetails = await this.movieModel.aggregate(pipeline);
    return movieDetails;
  }


  async searchMovies(criteria: MoviesSearchDto): Promise<Movies[]> {
    const { title, genre } = criteria;
    if (!title && !genre) {
      throw new BadRequestException('At least one of title, genre is required.');
    }
    const query: any = {};
    if (title) {
      query.title = title;
    }
    if (genre) {
      query.genre = genre;
    }
    return this.movieModel.find(query).exec();
  }



  async getMovieRecommendations(userId: string) {
    const userPreferences: UserPreferenceRes = await this.service.getUserPreferences(userId);
    const recommendedMovies = await this.movieModel
      .find({ genre: { $in: userPreferences.viewingHabits } })
      .limit(5)
      .exec();

    return recommendedMovies;
  }


  async makeBooking(bookingRequest:BookingRequestDTO,user_id: string): Promise<Booking> {
    const {movieId,theaterId,showtime, numberOfTickets} = bookingRequest;
    const movie = await this.movieModel.findById(movieId).exec();
    if (!movie) {
      throw new BadRequestException('Movie not found');
    }

    // Check if the theater exists
    const theater = await this.theaterModel.findById(theaterId).exec();
    if (!theater) {
      throw new BadRequestException('Theater not found');
    }

    //checking if a user has subscription
    const userSubscription = await this.subscriptionModel.findOne({
      userId: user_id,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    let total_price = movie.ticket_price * numberOfTickets; // Default total price
    if (userSubscription) {
      const discountAmount = (Number(userSubscription.discountPercentage) / 100) * total_price;
      total_price -= discountAmount;
    }
  
    const booking = new this.bookingModel({
      user_id: user_id,
      movie_id: movieId,
      theater_id: theaterId,
      showtime : showtime,
      numberOfTickets: numberOfTickets,
      totalAmount: total_price,
      status: BookingStatus.Booked,
    });
    return booking.save();
  }

  async checkAvailability(movieId : string,theaterId: string,showtime:Date, numberOfTickets: number,) {
    const theater = await this.theaterModel.findById(theaterId);

    const existingReservations = await this.bookingModel.find({
      movie_id:movieId,
      theater_id:theaterId,
      showtime:showtime,
      status: 'Booked',
    });
    
    const totalReservedSeats = existingReservations.reduce((total, booking) => total + booking.numberOfTickets, 0);
    const availableCapacity = theater.total_seats - totalReservedSeats;
    
    if (availableCapacity === 0) {
      throw new BadRequestException('Theater is fully booked for the specified time.');
    } else if (numberOfTickets <= availableCapacity && numberOfTickets > 0) {
      return true;
    } else if (numberOfTickets <= 0) {
      throw new BadRequestException('Please provide a valid number of tickets.');
    } else {
      throw new BadRequestException(`Please provide numberOfTickets in the range (1-${availableCapacity}).`);
    }
  }


  async submitMovieReview(userId: string, movieId: string, reviewDto: ReviewDto): Promise<Review> {
    const newReview = new this.reviewModel({
      userId,
      movieId,
      rating: reviewDto.rating,
      feedback: reviewDto.feedback,
    });
    return newReview.save();
  }


  async getMovieReviews(movieId: string): Promise<Review[]> {
    const movie = await this.movieModel.findById(movieId);
    if (!movie) {
      throw new BadRequestException('Movie not found');
    }
    const reviews = await this.reviewModel.find({ movieId: movieId });
    return reviews;
  }

}
