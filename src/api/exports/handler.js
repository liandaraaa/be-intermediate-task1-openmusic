import autoBind from "auto-bind";

class ExportsHandler {
  constructor(service, validator, playlistService ) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;

    autoBind(this)
  }
 
    async postExportPlaylistHandler(request, h) { 
    this._validator.validateExportPlaylistPayload(request.payload);
 
    const playlistId = request.params.playlistId;
    const { id: credentialId } = request.auth.credentials;
    
    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    
    const message = {
      playlistId: playlistId,
      targetEmail: request.payload.targetEmail,
    };
 
    await this._service.sendMessage('export:playlist', JSON.stringify(message));
 
    const response = h.response({
    "status": "success",
    "message": "Permintaan Anda sedang kami proses",
});
    response.code(201);
    return response;
  }
}

export default ExportsHandler;
