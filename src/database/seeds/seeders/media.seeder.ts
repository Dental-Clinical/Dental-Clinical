import { EntityManager } from 'typeorm';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { ClinicalCaseMedia } from 'src/clinical-case-media/clinical-case-media.entity';
import { Student } from 'src/students/student.entity';
import { SeedContext } from '../seed-context';
import { backdate, insert } from '../support/persistence.helper';
import { CaseBlueprint } from '../data/case-blueprint';

/**
 * Case gallery uploads.
 *
 * Nothing is sent to Cloudinary: the seed writes the metadata rows a successful
 * upload would have produced, with `public_id` values that follow the same
 * folder convention. See `MediaFactory` for how the delivery URL is built.
 */
export class MediaSeeder {
  readonly name = 'case media';

  async seed(
    context: SeedContext,
    manager: EntityManager,
    params: {
      scenario: CaseBlueprint;
      clinicalCase: ClinicalCase;
      uploadedBy: Student;
      /** Media is dated against the last clinical activity on the case. */
      uploadedAt: Date;
    },
  ): Promise<void> {
    for (const blueprint of params.scenario.caseMedia ?? []) {
      const asset = context.media.build(
        'case-media',
        params.scenario.key,
        blueprint,
      );

      const row = await insert(manager, ClinicalCaseMedia, {
        clinicalCase: params.clinicalCase,
        uploadedBy: params.uploadedBy,
        publicId: asset.publicId,
        fileUrl: asset.fileUrl,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        description: asset.description,
      });

      await backdate(manager, ClinicalCaseMedia, row.id, {
        createdAt: params.uploadedAt,
      });

      context.logger.created('case media', blueprint.label);
    }
  }
}
