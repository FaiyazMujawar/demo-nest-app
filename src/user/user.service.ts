import { Inject, Injectable } from '@nestjs/common';
import { DB, DbType } from '../global/providers/db.provider';
import { USERS } from '../schema';
import { AddUserRequest } from './types';
import { eq, or } from 'drizzle-orm';
import _ from 'lodash';
import { badRequest } from '../utils/exceptions.utils';
import { hashSync } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@Inject(DB) private db: DbType) {}

  async getAll() {
    return (await this.db.select().from(USERS)).map((user) => {
      delete user.password;
      return user;
    });
  }

  async add(addUserRequest: AddUserRequest) {
    const users = await this.db
      .select()
      .from(USERS)
      .where(
        or(
          eq(USERS.email, addUserRequest.email),
          eq(USERS.username, addUserRequest.username),
        ),
      );
    if (!_.isEmpty(users)) {
      const { email, username } = addUserRequest;
      let message = '';
      if (users.some((user) => user.email === email)) {
        message = 'Email';
      }
      if (users.some((user) => user.username === username)) {
        if (!_.isEmpty(message)) message += ' and ';
        message += 'Username';
      }
      message += ' already in use';
      throw badRequest(message);
    }
    console.log({ addUserRequest });

    const user = await this.db
      .insert(USERS)
      .values({
        ...addUserRequest,
        password: hashSync(addUserRequest.password, 10),
      })
      .returning();

    delete user[0].password;

    return { user: user[0] };
  }
}
