import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        const { message = 'Success', ...responseData } = data ?? {};

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data: responseData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
