import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user.service';
import { User } from '../entities/user.entity';
import { OtpService } from '../../otp/otp.service';
import { EmailService } from '../../email/email.service';
import { Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OTPType } from '../../otp/types/otpType';

// Mock bcrypt
jest.mock('bcryptjs');

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;
  let otpService: jest.Mocked<OtpService>;
  let emailService: jest.Mocked<EmailService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
            find: jest.fn(),
          },
        },
        { provide: OtpService, useValue: { generateToken: jest.fn() } },
        { provide: EmailService, useValue: { sendEmail: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    otpService = module.get(OtpService);
    emailService = module.get(EmailService);
    configService = module.get(ConfigService);
  });

  // --------------------------------------------------------------------------
  describe('register', () => {
    const dto = { email: 'test@example.com', password: 'pass123' };

    it('should create a new user and send OTP', async () => {
      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      userRepository.create.mockReturnValue({
        id: '1',
        email: dto.email,
        password: 'hashed',
        createdAt: new Date(),
      } as User);
      userRepository.save.mockResolvedValue({
        id: '1',
        email: dto.email,
        password: 'hashed',
        createdAt: new Date(),
      } as User);

      const emailVerificationSpy = jest
        .spyOn(service, 'emailVerification')
        .mockResolvedValue(undefined);

      await service.register(dto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(emailVerificationSpy).toHaveBeenCalled();
    });

    it('should throw if email already exists', async () => {
      userRepository.findOne.mockResolvedValue({ email: dto.email } as User);
      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // --------------------------------------------------------------------------
  describe('emailVerification', () => {
    const user = { email: 'user@example.com' } as User;

    it('should send OTP email', async () => {
      otpService.generateToken.mockResolvedValue('123456');

      await service.emailVerification(user, OTPType.OTP);

      expect(emailService.sendEmail).toHaveBeenCalledWith({
        recipients: [user.email],
        subject: 'OTP for verification',
        html: expect.stringContaining('123456'),
      });
    });

    it('should send RESET_LINK email', async () => {
      otpService.generateToken.mockResolvedValue('token123');
      configService.get.mockReturnValue('https://frontend/reset');

      await service.emailVerification(user, OTPType.RESET_LINK);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          recipients: [user.email],
          subject: 'Password Reset Link',
          html: expect.stringContaining(
            'https://frontend/reset?token=token123',
          ),
        }),
      );
    });
  });

  // --------------------------------------------------------------------------
  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const user = { id: '1', email: 'a@a.com' } as User;
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail(user.email);
      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
    });
  });

  // --------------------------------------------------------------------------
  describe('deleteUser', () => {
    it('should throw if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.deleteUser('1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should soft delete if user exists', async () => {
      userRepository.findOne.mockResolvedValue({ id: '1' } as User);
      userRepository.softDelete.mockResolvedValue({} as UpdateResult);

      const result = await service.deleteUser('1');
      expect(userRepository.softDelete).toHaveBeenCalledWith('1');
      expect(result.message).toBe('User soft-deleted successfully');
    });
  });

  // --------------------------------------------------------------------------
  describe('getUserById', () => {
    it('should return user data without todos', async () => {
      const user = {
        id: '1',
        email: 'a@a.com',
        createdAt: new Date(),
      } as User;
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.getUserById('1', false);
      expect(result).toMatchObject({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      });
    });

    it('should throw if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.getUserById('1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // --------------------------------------------------------------------------
  describe('getAllUsers', () => {
    it('should return mapped users', async () => {
      const users = [
        {
          id: '1',
          email: 'a@a.com',
          createdAt: new Date(),
          todos: [],
        },
      ] as unknown as User[];
      userRepository.find.mockResolvedValue(users);

      const result = await service.getAllUsers();
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('a@a.com');
    });

    it('should throw on repository error', async () => {
      userRepository.find.mockRejectedValue(new Error());
      await expect(service.getAllUsers()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // --------------------------------------------------------------------------
  describe('restoreUser', () => {
    it('should throw if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.restoreUser('1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if user is not deleted', async () => {
      userRepository.findOne.mockResolvedValue({
        id: '1',
        deletedAt: null,
      } as unknown as User);
      await expect(service.restoreUser('1')).rejects.toThrow(
        'User is not deleted',
      );
    });

    it('should restore user successfully', async () => {
      userRepository.findOne.mockResolvedValue({
        id: '1',
        deletedAt: new Date(),
      } as unknown as User);
      userRepository.restore.mockResolvedValue({} as UpdateResult);

      const result = await service.restoreUser('1');
      expect(userRepository.restore).toHaveBeenCalledWith({ id: '1' });
      expect(result.message).toBe('User restored successfully');
    });
  });
});
