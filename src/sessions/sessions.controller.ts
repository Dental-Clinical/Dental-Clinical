import { Body, Controller, Get, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';

@Controller('sessions')
export class SessionsController {}
