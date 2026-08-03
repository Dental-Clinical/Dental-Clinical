import { join } from 'path';
import { config as loadEnv } from 'dotenv';

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
loadEnv({ path: join(process.cwd(), envFile) });

export interface SeedConfig {
  /** Drops every seeded table before running. Never enabled implicitly. */
  reset: boolean;
  /** Bypasses the production guard. Required together with `reset` outside development. */
  force: boolean;
  /** Plain password shared by every seeded account, hashed once per run. */
  password: string;
  /**
   * Base URL used to build media links. Defaults to a deterministic placeholder
   * service so the frontend gallery renders real pixels without touching Cloudinary.
   * Point it at a Cloudinary delivery URL once the assets are actually uploaded.
   */
  mediaBaseUrl: string;
  /** Cloudinary folder convention mirrored in every generated `public_id`. */
  mediaFolder: string;
  /**
   * Timeline anchor. Every relative date in the scenarios is derived from it, so
   * pinning it (SEED_ANCHOR_DATE=2026-03-01) makes a run byte-for-byte reproducible.
   */
  anchor: Date;
  verbose: boolean;
}

function bool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function loadSeedConfig(): SeedConfig {
  const anchorRaw = process.env.SEED_ANCHOR_DATE;
  const anchor = anchorRaw ? new Date(anchorRaw) : new Date();

  if (Number.isNaN(anchor.getTime())) {
    throw new Error(`SEED_ANCHOR_DATE is not a valid date: "${anchorRaw}"`);
  }

  return {
    reset: bool(process.env.SEED_RESET),
    force: bool(process.env.SEED_FORCE),
    password: process.env.SEED_PASSWORD ?? 'Dental@2026',
    mediaBaseUrl:
      process.env.SEED_MEDIA_BASE_URL ?? 'https://picsum.photos/seed',
    mediaFolder: process.env.SEED_MEDIA_FOLDER ?? 'dental-clinical/seed',
    anchor,
    verbose: bool(process.env.SEED_VERBOSE, true),
  };
}
