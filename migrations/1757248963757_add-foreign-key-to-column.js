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
  pgm.addConstraint('songs', 'fk_songs.album_id_album.id', {
    foreignKeys: {
      columns: 'album_id',
      references: 'album(id)',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlists_id_playlists.id', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.songs_id_songs.id', {
    foreignKeys: {
      columns: 'song_id',
      references: 'songs(id)',
      onDelete: 'CASCADE',
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id');
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id');
};
