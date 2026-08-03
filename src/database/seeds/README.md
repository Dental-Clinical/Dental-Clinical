# Demo seed

Generates a coherent dental-school dataset: one clinical case per lifecycle
stage, with every related entity the API would have produced along the way.

```bash
npm run seed          # additive — skips scenarios that already exist
npm run seed:fresh    # SEED_RESET=true — truncates seeded tables first
```

## Environment

| Variable               | Default                      | Purpose                                                                 |
| ---------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| `SEED_RESET`           | `false`                      | Truncate seeded tables before running.                                   |
| `SEED_FORCE`           | `false`                      | Required to reset when `NODE_ENV=production`.                            |
| `SEED_PASSWORD`        | `Dental@2026`                | Shared password for every seeded account.                                |
| `SEED_ANCHOR_DATE`     | today                        | Pins the timeline; makes a run byte-for-byte reproducible.               |
| `SEED_MEDIA_BASE_URL`  | `https://picsum.photos/seed` | Point at `https://res.cloudinary.com/<cloud>` once assets are uploaded.  |
| `SEED_MEDIA_FOLDER`    | `dental-clinical/seed`       | Cloudinary folder convention mirrored in every `public_id`.              |
| `SEED_VERBOSE`         | `true`                       | Per-entity run log.                                                     |

## Layout

```
seeds/
├── seed.ts                  CLI entry point (standalone DataSource, no Nest container)
├── seed-runner.ts           owns every transaction boundary
├── seed-context.ts          typed registries shared between seeders
├── seeder.interface.ts      the one contract a pipeline seeder implements
├── seed.config.ts           environment
├── data/                    the dataset, as declarative blueprints
│   ├── people.data.ts       admin, coordinator, 2 supervisors, 5 students
│   ├── patients.data.ts     10 patients with real medical histories
│   ├── academic.data.ts     study years, sections, subjects, procedure requirements
│   ├── materials.data.ts    consumables catalogue
│   ├── progress.data.ts     carry-over credit from earlier in the term
│   ├── case-blueprint.ts    the scenario type
│   └── scenarios.data.ts    9 clinical cases + 2 pending requests
├── seeders/                 one slice of the dataset each
└── support/                 clock, media, teeth, persistence, logging, reset
```

## What gets created

| Scenario                         | Stage                      | Notable contents                                                     |
| -------------------------------- | -------------------------- | -------------------------------------------------------------------- |
| Deep caries 16                   | `OPEN`                     | request, attachment, completed examination, no student                |
| Necrotic 36                      | `OPEN`                     | second open case, different subject                                   |
| Proximal caries 24/25            | `ASSIGNED`                 | student, supervisor, one future appointment                           |
| Irreversible pulpitis 46         | `DIAGNOSIS_PENDING_REVIEW` | submission + 3 images + 2 planned procedures, **no** review yet       |
| Four restorations                | `TREATMENT_IN_PROGRESS`    | 3 completed sessions, 1 active today, 1 upcoming, materials, media    |
| Chronic periodontitis            | `TREATMENT_IN_PROGRESS`    | includes a `NO_SHOW` appointment / `PATIENT_ABSENT` session           |
| Three restorations               | `AWAITING_CASE_REVIEW`     | everything completed, evaluation pending                              |
| Anticoagulated patient           | `COMPLETED`                | evaluation `A-`, `closed_at`, credited progress                       |
| Multi-visit root canal           | `COMPLETED`                | evaluation `B+`, one planned procedure across two sessions            |
| Bisphosphonate patient           | pending request            | booked examination, never converted — keeps the coordinator queue full |
| Chipped incisor                  | pending request            | returning patient, no slot yet                                        |

## Rules the data obeys

These mirror the service layer; violating them throws at seed time rather than
producing states the API can never return.

- A case leaves `OPEN` only when a student books a clinical appointment.
- `TREATMENT_IN_PROGRESS` requires an approved diagnosis (a `SupervisorReview`).
- Procedures and materials are written **at session completion** — `ACTIVE`,
  `UPCOMING` and `PATIENT_ABSENT` sessions carry neither.
- A `COMPLETED` session references at least one planned procedure.
- `AWAITING_CASE_REVIEW` requires every planned procedure to be completed.
- A `COMPLETED` case has an evaluation and a `closed_at`.
- A student only takes cases from a subject taught in their own clinic section.

## Idempotency

- **Baseline** (users, calendar, structure, schedules, enrollments): upserted on
  a natural key — email, level, name, `(subject, name)`.
- **Scenarios**: the examination request is the root of the subtree, so its
  presence means the case exists. The whole scenario is skipped, never partly
  rebuilt.
- **Student progress**: recomputed and written as absolute counts, so re-running
  never doubles a student's credit.

## Adding a scenario

Append a `CaseBlueprint` to `scenarios.data.ts`. No seeder changes are needed —
the stage guards in `ClinicalCaseSeeder` decide which parts apply, and the
consistency assertions will tell you if the case describes an impossible state.
