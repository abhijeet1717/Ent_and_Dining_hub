import { Body, Controller, Delete, Get, HttpStatus, Post, Put, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { JwtService } from '../middleware/jwt.service';
import { GrpcMethod } from '@nestjs/microservices';
import { USER_SERVICE_NAME, TokenRequest, TokenResponse, UserInfoRequest, UserInfoResponse, UserPreferenceReq, UserPreferenceRes } from 'src/proto/user/user';
import { JwtAuthGuard } from 'src/middleware/jwt.auth.guard';
import { Types } from 'mongoose';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }
  @Post('signup')
  async signupUser(@Body() userSignUp: CreateUserDto, @Res() res) {
    try {
      const existingUser = await this.userService.findByEmail(userSignUp.email);
      if (existingUser) {
        return res.status(HttpStatus.CONFLICT).json({
          message: 'User with the same email already exists',
        });
      }
      const user = await this.userService.signup(userSignUp);
      const profile_details = {
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        dietary_restrictions: user.dietary_restrictions,
        viewing_habits: user.viewing_habits,
        role: user.role,
        subscription_status: user.subscription_status,
        isActive: user.isActive,
        _id: user._id,
      };

      // if the registration is success
      res.status(HttpStatus.CREATED).json({
        message: 'User registration successful',
        profile_details,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'User registration failed',
        error,
      });
    }

  }

  @Post('login')
  async loginUser(@Body() userLogin: { email: string; password: string }, @Res() res) {
    const { status, message, token, error } = await this.userService.loginUser(userLogin.email, userLogin.password);

    if (status === 'success') {
      res.status(HttpStatus.OK).json({
        message,
        token,
      });
    } else {
      res.status(HttpStatus.UNAUTHORIZED).json({
        message,
        error,
      });
    }
  }

  @GrpcMethod(USER_SERVICE_NAME, 'validate')
  private validate(payload: TokenRequest): Promise<TokenResponse> {
    console.log(payload);
    return this.userService.validate(payload);
  }

  @GrpcMethod(USER_SERVICE_NAME, 'getUser')
  private getUser(payload: UserInfoRequest): Promise<UserInfoResponse> {
    console.log(payload);
    return this.userService.getUser(payload);
  }


  @GrpcMethod(USER_SERVICE_NAME, 'getUserPreferences')
  private async getUserPreferences(payload: UserPreferenceReq): Promise<UserPreferenceRes> {
    const userId = payload.userId;

    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }

    const objectId = new Types.ObjectId(userId);
    console.log(objectId + "--------------------");

    return this.userService.getUserPreferences(objectId);
  }


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Req() req,) {
    const userId = req.user;
    const profile_details = await this.userService.getUserProfile(userId);

    return { profile_details }
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Body() updatedProfile: UpdateUserDto, @Req() req, @Res() res) {
    try {
      const userId = req.user;
      const user = await this.userService.findByUserId(userId);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'User not found',
        });
      }
      if (updatedProfile.name) {
        user.name = updatedProfile.name;
      }
      if (updatedProfile.email) {
        user.email = updatedProfile.email;
      }

      if (updatedProfile.preferences) {
        user.preferences = updatedProfile.preferences;
      }

      if (updatedProfile.dietary_restrictions) {
        user.dietary_restrictions = updatedProfile.dietary_restrictions;
      }

      if (updatedProfile.viewing_habits) {
        user.viewing_habits = updatedProfile.viewing_habits;
      }

      if (updatedProfile.role) {
        user.role = updatedProfile.role;
      }

      if (updatedProfile.subscription_status) {
        user.subscription_status = updatedProfile.subscription_status;
      }

      await this.userService.updateUserProfile(user);

      res.status(HttpStatus.OK).json({
        message: 'User profile updated successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to update user profile',
        error: error.message,
      });
    }
  }


  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteUserProfile(@Req() req, @Res() res) {
    try {
      const userId = req.user;
      const deletedUser = await this.userService.deleteUser(userId);

      if (!deletedUser) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'User not found',
        });
      }

      res.status(HttpStatus.OK).json({
        message: 'User profile deleted successfully',
        user: deletedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to delete user profile',
        error: error.message,
      });
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logoutUser(@Req() req){
      const userId = req.user
      try {
        // Invalidate user's session by setting isActive to false
        await this.userService.invalidateUserSession(userId);
        return { message: 'Logout successful' };
      } catch (error) {
        throw new UnauthorizedException('Invalid session');
      }
  }

}

