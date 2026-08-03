import { SeedConfig } from '../seed.config';

export type MediaKind = 'request-attachment' | 'diagnosis-image' | 'case-media';

export interface MediaBlueprint {
  /** Stable slug — becomes both the file name and the Cloudinary public id. */
  slug: string;
  label: string;
  description?: string;
  mimeType?: string;
}

export interface SeededAsset {
  publicId: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  description?: string;
}

/**
 * Builds Cloudinary-shaped asset records without uploading anything.
 *
 * `public_id` follows the exact folder convention the CloudinaryService uses, so
 * swapping the seed over to real uploads later means changing the URL builder
 * only — no schema or consumer changes. `file_url` points at a deterministic
 * placeholder by default so the case gallery and diagnosis viewer render actual
 * images during frontend development instead of broken-image icons.
 */
export class MediaFactory {
  constructor(private readonly config: SeedConfig) {}

  build(
    kind: MediaKind,
    scenarioKey: string,
    blueprint: MediaBlueprint,
  ): SeededAsset {
    const publicId = `${this.config.mediaFolder}/${kind}/${scenarioKey}/${blueprint.slug}`;
    const mimeType = blueprint.mimeType ?? 'image/jpeg';
    const extension = mimeType === 'application/pdf' ? 'pdf' : 'jpg';

    return {
      publicId,
      fileUrl: this.url(publicId, kind),
      fileName: `${blueprint.slug}.${extension}`,
      mimeType,
      description: blueprint.description ?? blueprint.label,
    };
  }

  private url(publicId: string, kind: MediaKind): string {
    const base = this.config.mediaBaseUrl.replace(/\/$/, '');

    // Cloudinary delivery URL when pointed at a real cloud …
    if (base.includes('res.cloudinary.com')) {
      return `${base}/image/upload/${publicId}.jpg`;
    }

    // … deterministic placeholder otherwise. The seed slug drives the seed of the
    // placeholder service, so the same case always shows the same picture.
    const dimensions = kind === 'diagnosis-image' ? '1200/900' : '1000/750';
    const slug = encodeURIComponent(publicId.replace(/\//g, '-'));
    return `${base}/${slug}/${dimensions}`;
  }
}
