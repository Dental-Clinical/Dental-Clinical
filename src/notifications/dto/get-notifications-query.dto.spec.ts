import { plainToInstance } from 'class-transformer';
import { GetNotificationsQueryDto } from './get-notifications-query.dto';

/**
 * Mirrors the global ValidationPipe in `src/main.ts`. `enableImplicitConversion`
 * is the reason `isRead` reads its raw value off the source object: without it
 * the pipe coerces the query string 'false' to Boolean('false') === true and
 * the unread filter silently returns the read rows instead.
 */
const parse = (query: Record<string, string>) =>
  plainToInstance(GetNotificationsQueryDto, query, {
    enableImplicitConversion: true,
  });

describe('GetNotificationsQueryDto', () => {
  it("keeps isRead=false false under the pipe's implicit conversion", () => {
    expect(parse({ isRead: 'false' }).isRead).toBe(false);
  });

  it('parses isRead=true', () => {
    expect(parse({ isRead: 'true' }).isRead).toBe(true);
  });

  it('leaves isRead undefined when the filter is omitted', () => {
    expect(parse({}).isRead).toBeUndefined();
  });

  it('passes an unrecognised value through for @IsBoolean to reject', () => {
    expect(parse({ isRead: 'banana' }).isRead).toBe('banana');
  });

  it('still applies the shared pagination defaults', () => {
    const dto = parse({});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });
});
