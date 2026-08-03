export interface MaterialBlueprint {
  key: string;
  name: string;
  description: string;
}

/**
 * The clinic's consumables catalogue. Real product categories rather than
 * generated strings: a session that logs "Gutta-Percha Points" and "AH Plus
 * Sealer" against an obturation appointment reads correctly to a clinician,
 * which is the whole point of the demo dataset.
 */
export const MATERIALS: MaterialBlueprint[] = [
  {
    key: 'material.anesthetic',
    name: 'Lidocaine 2% with Epinephrine 1:80,000',
    description: 'Local anaesthetic cartridge, 1.8 ml.',
  },
  {
    key: 'material.composite-a2',
    name: 'Composite Resin — Shade A2',
    description: 'Nano-hybrid light-cured restorative composite.',
  },
  {
    key: 'material.etchant',
    name: 'Phosphoric Acid Etchant 37%',
    description: 'Enamel and dentine conditioning gel.',
  },
  {
    key: 'material.bonding-agent',
    name: 'Universal Bonding Agent',
    description: 'Single-bottle adhesive for total- and self-etch technique.',
  },
  {
    key: 'material.matrix-band',
    name: 'Sectional Matrix Band and Ring',
    description: 'Proximal contour and isolation for Class II restorations.',
  },
  {
    key: 'material.amalgam-capsule',
    name: 'Dental Amalgam Capsule',
    description: 'Pre-dosed spherical alloy capsule.',
  },
  {
    key: 'material.glass-ionomer',
    name: 'Glass Ionomer Restorative Cement',
    description: 'Fluoride-releasing cement for cervical lesions.',
  },
  {
    key: 'material.gutta-percha',
    name: 'Gutta-Percha Points',
    description: 'Standardised obturation cones, ISO sizes 15–40.',
  },
  {
    key: 'material.sodium-hypochlorite',
    name: 'Sodium Hypochlorite 5.25%',
    description: 'Primary root canal irrigant.',
  },
  {
    key: 'material.edta',
    name: 'EDTA Solution 17%',
    description: 'Chelating irrigant for smear-layer removal.',
  },
  {
    key: 'material.calcium-hydroxide',
    name: 'Calcium Hydroxide Paste',
    description: 'Intracanal medicament dressing between visits.',
  },
  {
    key: 'material.ah-plus-sealer',
    name: 'AH Plus Root Canal Sealer',
    description: 'Epoxy resin-based sealer for lateral condensation.',
  },
  {
    key: 'material.k-files',
    name: 'Stainless Steel K-Files',
    description: 'Hand instrumentation files, 21 mm and 25 mm.',
  },
  {
    key: 'material.rubber-dam',
    name: 'Rubber Dam Kit',
    description: 'Sheet, clamps and frame for absolute isolation.',
  },
  {
    key: 'material.ultrasonic-tip',
    name: 'Ultrasonic Scaler Tip',
    description: 'Universal supragingival scaling insert.',
  },
  {
    key: 'material.gracey-curette',
    name: 'Gracey Curette Set',
    description: 'Site-specific curettes for subgingival root planing.',
  },
  {
    key: 'material.chlorhexidine',
    name: 'Chlorhexidine Gluconate 0.2% Rinse',
    description: 'Post-operative antimicrobial mouth rinse.',
  },
  {
    key: 'material.periodontal-probe',
    name: 'Periodontal Probe — Williams',
    description: 'Calibrated probe for pocket depth charting.',
  },
  {
    key: 'material.cotton-rolls',
    name: 'Cotton Rolls and Saliva Ejector',
    description: 'Relative isolation consumables.',
  },
];
