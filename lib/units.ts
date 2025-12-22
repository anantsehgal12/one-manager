// Unit configuration for display purposes
export interface UnitConfig {
  value: string
  label: string
  abbreviation: string
}

export const UNIT_OPTIONS: UnitConfig[] = [
  { value: 'pieces', label: 'Pieces', abbreviation: 'PCS' },
  { value: 'kilograms', label: 'Kilograms', abbreviation: 'KGs' },
  { value: 'boxes', label: 'Boxes', abbreviation: 'BOX' },
  { value: 'sets', label: 'Sets', abbreviation: 'SETS' },
  { value: 'units', label: 'Units', abbreviation: 'UNIT' },
  { value: 'others', label: 'Others', abbreviation: 'OTH' },
]

export function getUnitLabel(unitValue: string): string {
  const unit = UNIT_OPTIONS.find(u => u.value === unitValue)
  return unit ? `${unit.label} [${unit.abbreviation}]` : unitValue
}

export function getUnitAbbreviation(unitValue: string): string {
  const unit = UNIT_OPTIONS.find(u => u.value === unitValue)
  return unit ? unit.abbreviation : unitValue.toUpperCase()
}

export function getUnitDisplayName(unitValue: string): string {
  const unit = UNIT_OPTIONS.find(u => u.value === unitValue)
  return unit ? unit.label : unitValue
}

