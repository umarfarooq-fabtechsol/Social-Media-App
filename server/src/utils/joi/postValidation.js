const Joi = require('joi');

const postCreateSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(280)
    .required()
    .messages({
      'string.min': 'Post content must be at least 1 character long',
      'string.max': 'Post content cannot exceed 280 characters',
      'any.required': 'Post content is required'
    }),
  
  image: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Image URL must be a valid URL'
    })
});

const postUpdateSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(280)
    .messages({
      'string.min': 'Post content must be at least 1 character long',
      'string.max': 'Post content cannot exceed 280 characters'
    }),
  
  image: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Image URL must be a valid URL'
    })
});

module.exports = {
  postCreateSchema,
  postUpdateSchema
};