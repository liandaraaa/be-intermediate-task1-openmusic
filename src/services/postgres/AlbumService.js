import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import { mapDBToModel } from '../../utils/index.js';
 
class AlbumService {
  constructor() {
    this._pool = new Pool();
  }
 
  async addAlbum({name, year}) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
 
    const query = {
      text: 'INSERT INTO Album VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
 
    return result.rows[0].id;
  }

  async getAlbums() {
    const query = {
      text: 'SELECT * FROM Album'
    };
    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('Daftar Album tidak ditemukan');
    }
 
    return result.rows.map(mapDBToModel);
  }


   async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM Album WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
 
    return result.rows.map(mapDBToModel)[0];
  }

   async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE Album SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui Album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM Album WHERE id = $1 RETURNING id',
      values: [id],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

export default AlbumService;