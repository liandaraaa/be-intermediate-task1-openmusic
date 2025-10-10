import autoBind from "auto-bind";

class UploadsHandler {
  constructor(service, validator, albumService) {
    this._service = service;
    this._validator = validator;
    this._ablumService = albumService;
 
    autoBind(this)
  }
 
  async postUploadCoverAlbum(request, h) {
    const { cover } = request.payload;
    const albumId = request.params.id;

    console.log('cek post upload', cover, albumId)

    this._validator.validateImageHeaders(cover.hapi.headers);
 
    const filename = await this._service.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/album/${albumId}/images/${filename}`


    console.log('cek file upload', filename, coverUrl)

    await this._ablumService.addAlbumCoverUrl(albumId,coverUrl)
 
    const response = h.response({
    "status": "success",
    "message": "Sampul berhasil diunggah"
}
);
    response.code(201);
    return response;
  }
}

export default UploadsHandler;
