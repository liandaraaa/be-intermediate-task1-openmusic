import Joi from "joi";

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

export {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistPayloadSchema,
};
