export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  SELF_CONTAIN: 'Self Contain',
  ONE_BEDROOM: '1 Bedroom',
  TWO_BEDROOM: '2 Bedrooms',
  THREE_BEDROOM: '3 Bedrooms',
  DUPLEX: 'Duplex',
  BUNGALOW: 'Bungalow',
  FLAT: 'Flat',
};

// Common Nigerian rental amenities — a preset checklist rather than free
// text, so listings stay consistent and filterable later. Landlords can
// still add anything not on this list via "Other". Purely a frontend
// concept — the DB column is just TEXT[], so adding new presets here never
// needs a migration.
export const COMMON_AMENITIES = [
  '24/7 Electricity',
  'Borehole / Water Supply',
  'Gated & Secured',
  'CCTV',
  'Parking Space',
  'POP Ceiling',
  'Fitted Kitchen',
  'Wardrobes',
  'Air Conditioning',
  'Generator',
  'Prepaid Meter',
  'Tiled Compound',
  'Serviced Estate',
  'Swimming Pool',
];
