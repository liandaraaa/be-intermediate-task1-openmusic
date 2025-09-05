import { nanoid } from 'nanoid';
import { Pool } from 'pg';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import AuthorizationError from '../../exceptions/AuthorizationsError.js';

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }
 
 
  async addPlaylist({ name, owner }) {
    const id = nanoid(16);
    
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
 
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT id, name, owner as username FROM playlists WHERE owner = $1',
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }


    async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async postSongsToPlaylistId({ playlistId, songId }) {
    const id = nanoid(16);
    
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
 
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Songs gagal ditambahkan ke playlist');
    }
    return result.rows[0].id;
  }

  async getSongsFromPlaylistId(playlistId) {
    const query = {
       text: `
      SELECT 
        p.id AS playlist_id, 
        p.name AS playlist_name, 
        u.username, 
        json_agg(
          json_build_object(
            'id', s.id,
            'title', s.title,
            'performer', s.performer
          )
        ) AS songs
      FROM playlists p
      LEFT JOIN users u ON p.owner = u.id
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      LEFT JOIN songs s ON ps.song_id = s.id
      WHERE p.id = $1
      GROUP BY p.id, u.username
    `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    const playlist = result.rows[0];
    return {
      playlist: {
        id: playlist.playlist_id,
        name: playlist.playlist_name,
        username: playlist.username,
        songs: playlist.songs,
      },
    };
  }


    async deleteSongFromPlaylistId(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifySongId(songId){
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }
    return result.rows[0];
  }

  async verifyDuplicateSong(playlistId, songId) {
  const query = {
    text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
    values: [playlistId, songId],
  };
  const result = await this._pool.query(query);
  if (result.rows.length) {
    throw new InvariantError('Song sudah ada di playlist');
  }
}

}

export default PlaylistsService;
