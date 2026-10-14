import * as migration_20261013_115453_initial from './20261013_115453_initial';
import * as migration_20261014_055548_case_studies from './20261014_055548_case_studies';

export const migrations = [
  {
    up: migration_20261013_115453_initial.up,
    down: migration_20261013_115453_initial.down,
    name: '20261013_115453_initial',
  },
  {
    up: migration_20261014_055548_case_studies.up,
    down: migration_20261014_055548_case_studies.down,
    name: '20261014_055548_case_studies'
  },
];
