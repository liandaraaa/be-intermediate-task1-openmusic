/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Drop the unique constraint on the 'owner' column
  pgm.dropConstraint('playlists', 'playlists_owner_key', { ifExists: true });

  // Ensure the column is of type TEXT and not null
  pgm.alterColumn('playlists', 'owner', {
    type: 'TEXT',
    notNull: true,
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Re-add the unique constraint to the 'owner' column
  pgm.addConstraint('playlists', 'playlists_owner_key', {
    unique: ['owner'],
  });

  // Ensure the column is of type TEXT and not null
  pgm.alterColumn('playlists', 'owner', {
    type: 'TEXT',
    notNull: true,
  });
};