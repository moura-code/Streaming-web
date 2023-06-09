import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUser(@CurrentUser() user: User, @Req() request) {
    

    console.log("chegou no controler")
    const cookie = request?.headers.cookie;
    if (!this.isTokenValid(user.email, cookie.split('=')[1])) {
      throw new UnauthorizedException('Usuario ya ha hecho login en otro dispositivo o necesitas hacer login de vuelta');
    }
    console.log("chegou cookie n usado")
    delete user.password;
    return user;
  }
  /*
  //get all users
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findall();
  }
  @UseGuards(JwtAuthGuard)
  //get one user
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new Error('User not found');
    } else {
      return user;
    }
  }

  //create user
  @Post()
  async create(@Body() user: User): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    return await this.usersService.create(user);
  }
  @UseGuards(JwtAuthGuard)
  //update user
  @Put(':id')
  async update(@Param('id') id: number, @Body() user: User): Promise<User> {
    return this.usersService.update(id, user);
  }
  @UseGuards(JwtAuthGuard)
  //delete user
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    //handle the error if user not found
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.usersService.delete(id);
  }
  */
}
