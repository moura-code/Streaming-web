import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService.validateUser', () => {
  const service = new UsersService(null as any, null as any);
  const password = 'correct-password';
  let user: User;

  beforeAll(async () => {
    user = new User();
    user.email = 'test@test.com';
    user.password = await bcrypt.hash(password, 10);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the user when the password matches its bcrypt hash', async () => {
    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    await expect(service.validateUser(user.email, password)).resolves.toBe(user);
  });

  it('rejects a wrong password', async () => {
    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    await expect(service.validateUser(user.email, 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an unknown email', async () => {
    jest.spyOn(User, 'findOneBy').mockResolvedValue(null);
    await expect(service.validateUser('nobody@test.com', password)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
