/**
 * Migration: 1700000000000_enable_postgis
 * Enables PostGIS extension in PostgreSQL with reversible down migration.
 */

exports.up = (pgm) => {
  pgm.createExtension('postgis', { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropExtension('postgis', { ifExists: true, cascade: true });
};
