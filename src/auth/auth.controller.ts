import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { ClientInfo } from './decorators/client-info.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() dto: LoginDto,
    @ClientInfo() client: { ip: string; userAgent: string },
  ) {
    return this.authService.login(dto, client);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Body() body: { refreshToken: string }) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    const decoded = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString(),
    );
    const exp = decoded.exp - Math.floor(Date.now() / 1000);
    return this.authService.logout(accessToken, exp, body.refreshToken);
  }

  @Post('refresh')
  refresh(
    @Body() body: { refresh_token: string },
    @ClientInfo() client: { ip: string; userAgent: string },
  ) {
    return this.authService.refresh(body.refresh_token, client);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }
}
