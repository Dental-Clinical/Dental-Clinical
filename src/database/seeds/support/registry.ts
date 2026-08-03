/**
 * A keyed collection of entities produced by an earlier seeder.
 *
 * The point of `require()` is to turn "seeder B ran before seeder A" from a
 * silent NOT NULL violation five tables later into an immediate, named error.
 */
export class Registry<T> {
  private readonly items = new Map<string, T>();

  constructor(private readonly label: string) {}

  set(key: string, value: T): T {
    this.items.set(key, value);
    return value;
  }

  has(key: string): boolean {
    return this.items.has(key);
  }

  find(key: string): T | undefined {
    return this.items.get(key);
  }

  require(key: string): T {
    const value = this.items.get(key);
    if (!value) {
      throw new Error(
        `Seed context: no ${this.label} registered under "${key}". ` +
          `Known keys: [${[...this.items.keys()].join(', ') || 'none'}]. ` +
          `A seeder is either missing from the pipeline or running out of order.`,
      );
    }
    return value;
  }

  values(): T[] {
    return [...this.items.values()];
  }

  entries(): [string, T][] {
    return [...this.items.entries()];
  }

  get size(): number {
    return this.items.size;
  }
}
