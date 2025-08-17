import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import { mapSongDBToModel } from '../../utils/index.js';
 
class SongService {
  constructor() {
    this._pool = new Pool();
  }
 
  async addSong({title, year, genre, performer, duration, albumId}) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
 
    const query = {
      text: 'INSERT INTO Songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id,title, year, genre, performer, duration, albumId, createdAt, updatedAt],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }
 
    return result.rows[0].id;
  }

  async getSongs() {
    const query = {
      text: 'SELECT * FROM Songs'
    };
    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('Daftar Song tidak ditemukan');
    }
 
    return result.rows.map(mapSongDBToModel);
  }


   async getSongById(id) {
    const query = {
      text: 'SELECT * FROM Songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }
 
    return result.rows.map(mapSongDBToModel)[0];
  }

   async editSongById(id, { title, year, genre, performer, duration, albumId }) {

    const updatedAt = new Date().toISOString();
    const durationValue = duration || null;
    const albumIdValue = albumId || null;
    const query = {
      text: 'UPDATE Songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, durationValue, albumIdValue, updatedAt, id],
    };

    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui Song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM Songs WHERE id = $1 RETURNING id',
      values: [id],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

export default SongService;