import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { OTPType } from '../../otp/types/otpType';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';

describe('UserController (Integration)', () => {
  let app: INestApplication;

  const mockUserService = {
    register: jest.fn(),
    findByEmail: jest.fn(),
    emailVerification: jest.fn(),
    getAllUsers: jest.fn(),
    deleteUser: jest.fn(),
    restoreUser: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(() => jest.clearAllMocks());

  afterAll(async () => await app.close());

  describe('/POST user/register', () => {
    it('should register a user successfully', async () => {
      mockUserService.register.mockResolvedValueOnce(undefined);

      const res = await request(app.getHttpServer())
        .post('/user/register')
        .send({ email: 'test@example.com', password: '123456' })
        .expect(201);

      expect(res.body.message).toBe(
        'User created successfully and OTP sent to email.',
      );
      expect(mockUserService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '123456',
      });
    });
  });

  describe('/POST user/request-otp', () => {
    it('should send OTP successfully', async () => {
      const user = { id: uuidv4(), email: 'test@example.com' };
      mockUserService.findByEmail.mockResolvedValueOnce(user);
      mockUserService.emailVerification.mockResolvedValueOnce(undefined);

      const res = await request(app.getHttpServer())
        .post('/user/request-otp')
        .send({ email: 'test@example.com' })
        .expect(201);

      expect(res.body.message).toBe(
        'OTP sent successfully. Please check email',
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUserService.emailVerification).toHaveBeenCalledWith(
        user,
        OTPType.OTP,
      );
    });

    it('should return 404 if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValueOnce(null);

      const res = await request(app.getHttpServer())
        .post('/user/request-otp')
        .send({ email: 'notfound@example.com' })
        .expect(404);

      expect(res.body.message).toBe('User with this email does not exist');
    });
  });

  describe('/GET user/all', () => {
    it('should return list of all users', async () => {
      const users = [{ id: uuidv4(), email: 'a@a.com' }];
      mockUserService.getAllUsers.mockResolvedValueOnce(users);

      const res = await request(app.getHttpServer())
        .get('/user/all')
        .expect(200);

      expect(res.body).toEqual(users);
      expect(mockUserService.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('/DELETE user/delete/:id', () => {
    it('should delete user successfully', async () => {
      const userId = uuidv4();
      mockUserService.deleteUser.mockResolvedValueOnce(undefined);

      const res = await request(app.getHttpServer())
        .delete(`/user/delete/${userId}`)
        .expect(200);

      expect(res.body.message).toBe('User deleted successfully');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('/POST user/restore/:id', () => {
    it('should restore user successfully', async () => {
      const userId = uuidv4();
      mockUserService.restoreUser.mockResolvedValueOnce({
        message: 'User restored successfully',
      });

      const res = await request(app.getHttpServer())
        .post(`/user/restore/${userId}`)
        .expect(201);

      expect(res.body.message).toBe('User restored successfully');
      expect(mockUserService.restoreUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('/POST user/forgot-password', () => {
    it('should send password reset link', async () => {
      const user = { id: uuidv4(), email: 'reset@example.com' };
      mockUserService.findByEmail.mockResolvedValueOnce(user);
      mockUserService.emailVerification.mockResolvedValueOnce(undefined);

      const res = await request(app.getHttpServer())
        .post('/user/forgot-password')
        .send({ email: 'reset@example.com' })
        .expect(201);

      expect(res.body.message).toBe(
        'Password reset link has been sent. Please check your email.',
      );
      expect(mockUserService.emailVerification).toHaveBeenCalledWith(
        user,
        OTPType.RESET_LINK,
      );
    });

    it('should return 400 if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValueOnce(null);

      const res = await request(app.getHttpServer())
        .post('/user/forgot-password')
        .send({ email: 'unknown@example.com' })
        .expect(400);

      expect(res.body.message).toBe('User with this email does not exist');
    });
  });
});
