/**
 * Deliberately not Nest's Logger: the seeder runs as a standalone script without
 * the Nest container, and its output is meant to be read as a run report.
 */
export class SeedLogger {
  private depth = 0;
  private readonly counters = new Map<string, number>();

  constructor(private readonly verbose: boolean) {}

  section(title: string): void {
    this.write(`\n▸ ${title}`);
  }

  step(message: string): void {
    if (!this.verbose) return;
    this.write(`  ${'  '.repeat(this.depth)}· ${message}`);
  }

  created(entity: string, detail?: string): void {
    this.counters.set(entity, (this.counters.get(entity) ?? 0) + 1);
    this.step(detail ? `${entity}: ${detail}` : entity);
  }

  skipped(reason: string): void {
    this.step(`skipped — ${reason}`);
  }

  warn(message: string): void {
    this.write(`  ! ${message}`);
  }

  async nested<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.step(label);
    this.depth += 1;
    try {
      return await fn();
    } finally {
      this.depth -= 1;
    }
  }

  summary(): void {
    this.write('\n▸ Summary');
    const rows = [...this.counters.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    );
    if (rows.length === 0) {
      this.write('  nothing was created — every scenario already existed');
      return;
    }
    const width = Math.max(...rows.map(([name]) => name.length));
    for (const [name, count] of rows) {
      this.write(`  ${name.padEnd(width)}  ${count}`);
    }
  }

  private write(message: string): void {
    console.log(message);
  }
}
