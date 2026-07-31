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
      map((result) => {
        if (
          Array.isArray(result) ||
          result === null ||
          typeof result !== 'object'
        ) {
          return {
            success: true,
            statusCode: response.statusCode,
            message: 'Success',
            data: result,
            timestamp: new Date().toISOString(),
          };
        }
        const { message = 'Success', ...payload } = result;

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data: payload,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
