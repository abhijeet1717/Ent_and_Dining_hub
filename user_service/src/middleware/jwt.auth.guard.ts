import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/users/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly service: UserService) {}
 
    async canActivate(ctx: ExecutionContext): Promise<boolean> | never {
        const req: any = ctx.switchToHttp().getRequest();
        const authorization: string = req.headers['authorization'];
        if (!authorization) {
          throw new UnauthorizedException();
        }
        const bearer: string[] = authorization.split(' ');
        if (!bearer || bearer.length < 2) {
          throw new UnauthorizedException();
        }
        const token: string = bearer[1];


        try {
          const {userId}: any = await this.service.validateToken(token);
          const isSessionActive = await this.service.checkSessionIsActive(userId);
            if (!isSessionActive) {
                throw new UnauthorizedException();
            }
          req.user = userId;
          return true;
        } catch (error) {
          throw new UnauthorizedException();
        }
      }
    }
