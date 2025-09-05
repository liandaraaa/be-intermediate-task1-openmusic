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
 
  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.verifySongId(songId);
    await this._service.verifyDuplicateSong(playlistId, songId);
    await this._service.postSongsToPlaylistId({ playlistId, songId });

     const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

    async getSongsFromPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    const playlistSongs = await this._service.getSongsFromPlaylistId(playlistId);

    return {
      status: 'success',
      data: playlistSongs
    };
  }
 
  async deleteSongFromPlaylistHandler(request) {
    this._validator.validateDeleteSongFromPlaylistPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deleteSongFromPlaylistId(playlistId,songId);
 
    return {
      status: 'success',
      message: 'songs berhasil dihapus dari playlist',
    };
  }
}
 
export default PlaylistsHandler;