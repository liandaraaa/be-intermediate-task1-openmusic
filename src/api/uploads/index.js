import routes from './routes.js';
import UploadsHandler from './handler.js';

export default {
 name: 'uploads',
  version: '1.0.0',
  register: async (server, { service, validator, albumService }) => {
   const uploadsHandler = new UploadsHandler(service, validator, albumService);
    server.route(routes(uploadsHandler));
  },
};
