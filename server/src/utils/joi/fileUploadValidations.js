const Joi = require('joi');

const initiateUploadSchema = Joi.object({
  fileName: Joi.string().required().messages({
    'string.empty': 'File name is required',
    'any.required': 'File name is required'
  }),
  filetype: Joi.string().required().messages({
    'string.empty': 'File type is required',
    'any.required': 'File type is required'
  })
});

const generatePresignedUrlSchema = Joi.object({
  uploadId: Joi.string().required().messages({
    'string.empty': 'Upload ID is required',
    'any.required': 'Upload ID is required'
  }),
  partNumber: Joi.number().integer().min(1).max(10000).messages({
    'number.base': 'Part number must be a number',
    'number.integer': 'Part number must be an integer',
    'number.min': 'Part number must be at least 1',
    'number.max': 'Part number cannot exceed 10000',
    'any.required': 'Part number is required'
  }),
  fileName: Joi.string().required().messages({
    'string.empty': 'File name is required',
    'any.required': 'File name is required'
  })
});

const completeUploadSchema = Joi.object({
  uploadId: Joi.string().required().messages({
    'string.empty': 'Upload ID is required',
    'any.required': 'Upload ID is required'
  }),
  fileName: Joi.string().required().messages({
    'string.empty': 'File name is required',
    'any.required': 'File name is required'
  }),
  parts: Joi.array()
    .items(
      Joi.object({
        ETag: Joi.string().messages({
          'string.empty': 'ETag is required',
          'any.required': 'ETag is required'
        }),
        PartNumber: Joi.number().integer().min(1).messages({
          'number.base': 'Part number must be a number',
          'number.integer': 'Part number must be an integer',
          'number.min': 'Part number must be at least 1',
          'any.required': 'Part number is required'
        })
      })
    )
    .min(1)
    .messages({
      'array.min': 'At least one part is required',
      'any.required': 'Parts array is required'
    })
});

module.exports = {
  initiateUploadSchema,
  generatePresignedUrlSchema,
  completeUploadSchema
};
