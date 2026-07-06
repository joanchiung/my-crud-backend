import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  logout(@Headers('authorization') authorization?: string) {
    const token = this.authService.extractToken(authorization);
    return this.authService.logout(token);
  }

  @Post('forget-password')
  forgetPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgetPassword(dto);
  }

  @Get('verify')
  verify(@Headers('authorization') authorization?: string) {
    const token = this.authService.extractToken(authorization);
    return this.authService.verify(token);
  }

  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    const token = this.authService.extractToken(authorization);
    return this.authService.me(token);
  }
}
