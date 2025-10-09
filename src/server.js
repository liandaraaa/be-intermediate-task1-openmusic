import dotenv from 'dotenv';
dotenv.config();
import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt';

import AlbumsService from './services/postgres/AlbumService.js';
import albums from './api/albums/index.js';
import AlbumsValidator from './validator/albums/index.js';

import ClientError from './exceptions/ClientError.js'; 

import songs from './api/songs/index.js';
import SongService from './services/postgres/SongService.js';
import SongsValidator from './validator/songs/index.js';

import UsersValidator from './validator/users/index.js';
import UsersService from './services/postgres/UsersService.js';
import users from './api/users/index.js';

import authentications from './api/authentications/index.js';
import AuthenticationsService from './services/postgres/AuthenticationsService.js';
import AuthenticationsValidator from './validator/authentications/index.js';

import TokenManager from './tokenize/TokenManager.js';

import playlists from './api/playlists/index.js';
import PlaylistsService from './services/postgres/PlaylistsService.js';
import PlaylistsValidator from './validator/playlists/index.js';

import ExportsValidator from './validator/exports/index.js';
import ProducerService from './services/rabbitmq/ProducerService.js';
import _exports from './api/exports/index.js';

const init = async () => {
  const albumService = new AlbumsService();
  const songService = new SongService();
  const userService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
      },
      {
        plugin: users,
        options: {
          service: userService,
          validator: UsersValidator,
        },
      },
      {
      plugin: authentications,
      options: {
        authenticationsService: authenticationsService,
        usersService: userService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
        },
      },
      {
        plugin: playlists,
        options: {
          service: playlistsService,
          validator: PlaylistsValidator,
        },
      },
       {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistsService: playlistsService
      },
    },
    ],
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