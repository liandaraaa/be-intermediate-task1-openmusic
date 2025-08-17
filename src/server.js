import dotenv from 'dotenv';
dotenv.config();
import Hapi from '@hapi/hapi';
import AlbumsService from './services/postgres/AlbumService.js';
import albums from './api/albums/index.js';
import AlbumsValidator from './validator/albums/index.js';
import ClientError from './exceptions/ClientError.js'; 
import songs from './api/songs/index.js';
import SongService from './services/postgres/SongService.js';
import SongsValidator from './validator/songs/index.js';

const init = async () => {
  const albumService = new AlbumsService();
  const songService = new SongService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
 
  await server.register(
    [
      {
        plugin: albums,
        options: {
          service: albumService,
          validator: AlbumsValidator,
        },
      },
      {
        plugin: songs,
        options: {
          service: songService,
          validator: SongsValidator,
        },
      }
    ]
  );

  server.ext('onPreResponse', (request, h) => {
   const { response } = request;
 
   if (response instanceof ClientError) {
     const newResponse = h.response({
       status: 'fail',
       message: response.message,
     });
     newResponse.code(response.statusCode);
     return newResponse;
   }
     
   return h.continue;
 });
 
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
 
init();