import { Controller, Post, Body, Req, UseGuards, Get, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { ClientInfo } from './decorators/client-info.decorator';
import { Permissions } from './decorators/permissions.decorator';
import { Public } from './decorators/public.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Permissions('auth_login')
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @ClientInfo() client: { ip: string; userAgent: string },
  ) {
    return this.authService.login(dto, client);
  }

  @UseGuards(JwtAuthGuard)
  @Permissions('auth_logout')
  @Post('logout')
  async logout(@Req() req: Request, @Body() body: { refreshToken: string }) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    const decoded = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString(),
    );
    const exp = decoded.exp - Math.floor(Date.now() / 1000);
    return this.authService.logout(accessToken, exp, body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Permissions('auth_refresh')
  @Post('refresh')
  refresh(
    @Body() body: { refresh_token: string },
    @ClientInfo() client: { ip: string; userAgent: string },
  ) {
    return this.authService.refresh(body.refresh_token, client);
  }

  
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Please provide an email or phone number');
    }
    return this.authService.forgotPassword(dto);
  }

    @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    if (dto.newPassword !==dto.confirmPassword) {
      throw new BadRequestException('Confirm password  not matched');
    }
    return this.authService.resetPassword(dto);
  }
}
