import { Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../domain/user/user';
import { AuthenticationService } from '../config/authentication/authentication.service';
import { JwtAuthGuard } from '../config/authentication/jwt-auth-guard';
import { LocalAuthGuard } from '../config/authentication/local-auth-guard';
import { PostLoginResponse } from './models/post-login-response';

@Controller('/api/authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(200)
  async postLogin(): Promise<PostLoginResponse> {
    return {
      accessToken: this.authenticationService.generateAdminJwt(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Req() request: Request): Promise<User> {
    return request.user as User;
  }
}
