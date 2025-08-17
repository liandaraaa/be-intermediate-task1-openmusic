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
      text: 'SELECT tbl_album.id, tbl_album.name , tbl_album.year, tbl_songs.title, tbl_songs.performer, tbl_songs.id as id_song FROM Album as tbl_album  left join songs as tbl_songs on tbl_album.id = tbl_songs.album_id WHERE tbl_album.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = result.rows.reduce((acc, row) => {
      if (!acc.id) {
        acc.id = row.id;
        acc.name = row.name;
        acc.year = row.year;
        acc.songs = [];
      }
      if (row.id_song) {
        acc.songs.push({
          id: row.id_song,
          title: row.title,
          performer: row.performer,
        });
      }
      return acc;
    }, {});
  
    return album;
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

  async deleteAllAlbums() {
    const query = {
      text: 'DELETE FROM Album',
    };
 
    await this._pool.query(query);

    return {
      status: 'success',
      message: 'Semua album berhasil dihapus',
    };
  }
}

export default AlbumService;