import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  public async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }
  public async compare(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
