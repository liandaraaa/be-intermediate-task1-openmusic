import autoBind from "auto-bind";

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this)
  }
 
  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name = 'untitled' } = request.payload;
     const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({ name, owner:credentialId});
 
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }
 
  async getPlaylistsHandler(request) {
  const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }
 
  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);
     return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
 
  async postSongsToPlaylistHandler(request) {
    this._validator.validateSongsPayload(request.payload);
    const { id } = request.params;
 
    await this._service.editSongsById(id, request.payload);
 
    return {
      status: 'success',
      message: 'Songs berhasil diperbarui',
    };
  }
 
  async deleteSongsByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongsById(id);
 
    return {
      status: 'success',
      message: 'Songs berhasil dihapus',
    };
  }

  async deleteSongssHandler() {
    await this._service.deleteAllSongss();
 
    return {
      status: 'success',
      message: 'Semua Songs berhasil dihapus',
    };
  } 
}
 
export default PlaylistsHandler;