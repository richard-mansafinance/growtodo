import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JwtAuthGuard

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const dbUser = await this.userRepository.findOne({
        where: { id: user.id },
        select: ['id', 'roles'],
      });

      if (!dbUser) {
        throw new UnauthorizedException('User not found');
      }

      if (dbUser.roles !== 'admin') {
        throw new UnauthorizedException('Admin access required');
      }

      // Attach full user object to request for downstream use
      request.user = { ...user, roles: dbUser.roles };
      return true;
    } catch (error) {
      throw error instanceof UnauthorizedException
        ? error
        : new UnauthorizedException('Failed to verify admin role');
    }
  }
}
