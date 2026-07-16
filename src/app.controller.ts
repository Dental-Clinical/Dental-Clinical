import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AllowAnonymous } from './auth/decorators/allow-anonymous.decorator';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  @AllowAnonymous()
  getHello() {
    return { message: 'Hello World!' };
  }
}
