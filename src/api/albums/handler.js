import autoBind from "auto-bind";

class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this)
  }
 
  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = 'untitled', year } = request.payload;
 
    const albumId = await this._service.addAlbum({ name, year });
 
    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }
 
  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }
 
  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }
 
  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
 
    await this._service.editAlbumById(id, request.payload);
 
    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }
 
  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
 
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async deleteAlbumsHandler() {
    await this._service.deleteAllAlbums();
 
    return {
      status: 'success',
      message: 'Semua album berhasil dihapus',
    };
  } 

async postLikeAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyAlbumId(id)
    await this._service.verifyUserAuthorization(credentialId)
    await this._service.verifyUserLikeAlbum(credentialId, id)
    await this._service.likeAlbum(credentialId,id);
 
   const response = h.response({
      status: 'success',
      message: 'Kamu menyukai album ini'
    });
    response.code(201);
    return response;
  }

  async deleteLikeAlbumHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    
    await this._service.unlikeAlbum(credentialId,id);
      
      return {
        status: 'success',
        message: 'Kamu batal menyukai album ini',
      };
    }

  async getLikesAlbumHandler(request){
    const { id } = request.params;

    const result = await this._service.getAlbumLikes(id)

    return result
  }

}
 
export default AlbumHandler;