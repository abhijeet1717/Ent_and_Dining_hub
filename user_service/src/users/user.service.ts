import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Users } from "./entity/user.model";
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from "./dto/user.dto";
import { TokenRequest, TokenResponse, UserInfoRequest, UserInfoResponse } from "src/proto/user/user";
import { JwtService } from '../middleware/jwt.service';
import mongoose, { Model, Types } from "mongoose";
import { Sessions } from "./entity/session.entity";


@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name)
    private userModel: Model<Users>,
    @InjectModel(Sessions.name) private readonly userSessionModel: Model<Sessions>,
    private readonly jwtService: JwtService,

  ) { }


  async signup(userSignup: CreateUserDto) {
    const { name, email, password, preferences,
      dietary_restrictions,
      viewing_habits,
      subscription_status } = userSignup;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      preferences,
      dietary_restrictions,
      viewing_habits,
      subscription_status
    });
    const result = await newUser.save();
    return result;
  }

  async loginUser(email: string, password: string) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return { status: 'fail', message: 'User not found' };
      }

      const isPasswordValid = await this.comparePasswords(password, user.password);

      if (!isPasswordValid) {
        return { status: 'fail', message: 'Invalid password' };
      }

      const payload = { userId: user.id, role: user.role };
      const token = this.jwtService.generateToken(payload);

      await this.createUserSession(payload.userId);

      return { status: 'success', message: 'Login successful', token };
    } catch (error) {
      console.error(error);
      return { status: 'error', message: 'Login failed', error: error.message };
    }
  }
  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async findByUserId(userId: string) {
    const user = await this.userModel.findOne({ _id: userId }); 
    return user;
  }


  public async validate({ token }: TokenRequest): Promise<TokenResponse> {
    try {
      const decoded: TokenResponse = await this.jwtService.verify(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }
      const auth: any = await this.userModel.findById(decoded.userId);
      if (!auth) {
        throw new Error('User not found');
      }
      return { isValid: true, userId: decoded.userId, errorMessage: "No error" };
    } catch (error) {
      console.error(error.message);
      return { isValid: false, userId: null, errorMessage: error.message };
    }
  }


  async getUser({ userId }: UserInfoRequest): Promise<UserInfoResponse> {
    const user = await this.userModel.findOne({ _id: userId });
    return { name: user.name, email: user.email };
  }

  async getUserProfile(userId: string) {
    const data = await this.userModel.findOne({ _id: userId, isActive: true }).select('-password');
    if (!data) {
      throw new NotFoundException('User profile not found');
    }
    return data;
  }


  public async validateToken(token: string): Promise<any> {
    const decoded: any = await this.jwtService.verify(token);
    if (!decoded) {
      return { userId: null };
    }
    const auth: any = this.userModel.findById(decoded.userId);
    if (!auth) {
      return { userId: null };
    }
    return { userId: decoded.userId };
  }

  async updateUserProfile(user: any): Promise<any> {
    const updatedUser = await this.userModel.findByIdAndUpdate(user._id, user, { new: true }).exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }


  async createUserSession(userId: string): Promise<Sessions> {
    const existingSession = await this.userSessionModel.findOne({ userId });
    if (existingSession) {
      existingSession.isActive = true;
      existingSession.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const updatedSession = await existingSession.save();
      return updatedSession;
    }
    const newSession = new this.userSessionModel({ userId });
    const savedSession = await newSession.save();
    return savedSession;
  }


  async deleteUser(userId: string): Promise<Users> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = false;
    await user.save();
    return user;
  }

  async isUserActive(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    return user ? user.isActive : false;
  }


  async getUserPreferences(userId) {
    const user = await this.userModel.findOne({ _id: userId });
    console.log(user);
    return { viewingHabits: user.viewing_habits };
  }

  async invalidateUserSession(userId: string): Promise<void> {
    await this.userSessionModel.updateOne({ userId, isActive: true }, { isActive: false });
  }

  async checkSessionIsActive(userId: string) {
    const session = await this.userSessionModel.findOne({ userId, isActive: true });
    return !!session; 
  }
}