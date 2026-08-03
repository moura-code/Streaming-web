import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard, LocalAuthGuard } from 'src/guards';
import { CurrentUser } from './currentUser.decorator';
import { Response } from 'express';
import { CreateUser } from 'src/dto/CreateUserDto';

interface UsersTokens {
  userEmail: string;
  userTokens: string[];
}
@Controller('users')
export class UsersController {
  Invalidtokens: UsersTokens[];
  constructor(private readonly usersService: UsersService) {
    this.Invalidtokens = [];
  }
  addOrUpdateUserTokens(userEmail: string, newToken: string) {
    let userIndex = this.Invalidtokens.findIndex(
      (user) => user.userEmail === userEmail,
    );

    if (userIndex === -1) {
      // If user not found, add a new object with empty token array
      this.Invalidtokens.push({ userEmail, userTokens: [] });
      userIndex = this.Invalidtokens.length - 1;
    }

    const pastTokens = this.Invalidtokens[userIndex].userTokens;
    const updatedTokens = [...pastTokens, newToken];

    this.Invalidtokens[userIndex] = { userEmail, userTokens: updatedTokens };
  }
  isTokenValid(userEmail: string, token: string): boolean {
    const userIndex = this.Invalidtokens.findIndex(
      (user) => user.userEmail === userEmail,
    );

    if (userIndex === -1) {
      return false;
    }

    const userTokens = this.Invalidtokens[userIndex].userTokens;
    const lastToken = userTokens[userTokens.length - 1];

    return token === lastToken;
  }

  @Post('login')
  async login(
    @Body() body: CreateUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersService.validateUser(body.email, body.password)
    const result: [string, Response] = await this.usersService.login(
      user,
      response,
    );
    const token: string = result[0];
    response = result[1];
    this.addOrUpdateUserTokens(user.email, token);

    response.send({ msg: 'you are login', token: token });
  }

  @Post()
  async create(@Body() body: CreateUser): Promise<Partial<User>> {
    const plazo = new Date();
    plazo.setDate(plazo.getDate() + 30);
    const user = await this.usersService.create({
      email: body.email,
      password: await bcrypt.hash(body.password, 10),
      plazo,
    } as User);
    delete user.password;
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUser(@CurrentUser() user: User, @Req() request) {
    const cookieHeader: string = request?.headers?.cookie ?? '';
    const token = /(?:^|;\s*)Authentication=([^;]+)/.exec(cookieHeader)?.[1];
    if (!token || !this.isTokenValid(user.email, token)) {
      throw new UnauthorizedException('Usuario ya ha hecho login en otro dispositivo o necesitas hacer login de vuelta');
    }
    delete user.password;
    return user;
  }
}
