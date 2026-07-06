import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  // 已登出的 token 黑名單。只存在記憶體裡,伺服器重啟就會清空 —— 教學用的簡化版做法
  private readonly revokedTokens = new Set<string>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  extractToken(authorizationHeader: string | undefined): string {
    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少或格式錯誤的 Authorization header');
    }
    return authorizationHeader.slice('Bearer '.length);
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('email 已被註冊');
    }

    // 密碼直接明碼存進 DB,沒有做 hash —— 對應這次「沒有資安」的教學範圍
    const user = await this.usersService.create(dto.email, dto.password);
    return { id: user.id, email: user.email, status: user.status };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('email 或密碼錯誤');
    }

    await this.usersService.touchLastLogin(user.id);

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { token, status: 'ok', email: user.email };
  }

  logout(token: string) {
    this.revokedTokens.add(token);
    return { status: 'ok' };
  }

  verify(token: string) {
    if (this.revokedTokens.has(token)) {
      throw new UnauthorizedException('token 已登出');
    }

    const payload = this.jwtService.verify<JwtPayload>(token);
    return { valid: true, email: payload.email };
  }

  async me(token: string) {
    if (this.revokedTokens.has(token)) {
      throw new UnauthorizedException('token 已登出');
    }

    const payload = this.jwtService.verify<JwtPayload>(token);
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new NotFoundException('使用者不存在');
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async forgetPassword(dto: ForgetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('email 不存在');
    }

    const newPassword = randomBytes(4).toString('hex');
    await this.usersService.updatePassword(user.id, newPassword);

    // 沒有接寄信服務,用 log 模擬「把新密碼寄給使用者」這個動作
    console.log(
      `[forget-password] 新密碼已產生給 ${user.email}: ${newPassword}`,
    );

    return { status: 'ok' };
  }
}
