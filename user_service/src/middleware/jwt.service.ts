import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as Jwt } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class JwtService {
  private readonly jwt: Jwt;

  constructor(jwt: Jwt) {
    this.jwt = jwt;
  }
  public generateToken(payload) {
    return this.jwt.sign(payload);
  }


  // Decoding the JWT Token
  public async decode(token: string): Promise<unknown> {
    return this.jwt.decode(token, null);
  }


  // Validate User's password
  public async isPasswordValid(password: string, userPassword: string): Promise<boolean> {
    console.log(bcrypt.compare(password, userPassword))
    const state = await bcrypt.compare(password, userPassword);
    return state;
  }

  // Encode User's password
  public async encodePassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Validate JWT Token, throw forbidden error if JWT Token is invalid
  public async verify(token: string): Promise<any> {
    try {
      return this.jwt.verify(token);
    } catch (err) {
      throw new Error('Invalid token');
    }
  }
}
