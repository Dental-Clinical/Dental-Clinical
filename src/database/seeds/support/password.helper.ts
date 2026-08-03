import * as bcrypt from 'bcrypt';

/**
 * bcrypt is intentionally slow, and the seed creates ~17 accounts that all share
 * the same demo password. Hashing once and reusing the digest turns a few
 * seconds of CPU into a few milliseconds without weakening anything: the salt is
 * still random, it is simply the same salt for every seeded account.
 */
export class PasswordVault {
  private digest?: string;

  constructor(private readonly plain: string) {}

  async hash(): Promise<string> {
    if (!this.digest) {
      this.digest = await bcrypt.hash(this.plain, await bcrypt.genSalt());
    }
    return this.digest;
  }
}
