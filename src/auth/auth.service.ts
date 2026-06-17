import { Injectable } from '@nestjs/common';
import { PasswordService } from 'src/common/services/password.service';

@Injectable()
export class AuthService {
  constructor(private readonly passwordService: PasswordService) {}
}
