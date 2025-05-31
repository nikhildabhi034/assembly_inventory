import Joi from 'joi';
import { PartType } from '../models/Part';

export const createPartSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100)
    .messages({
      'string.empty': 'Part name is required',
      'string.min': 'Part name must be at least 2 characters long',
      'string.max': 'Part name cannot exceed 100 characters'
    }),
  type: Joi.string().valid(...Object.values(PartType)).required()
    .messages({
      'any.required': 'Part type is required',
      'any.only': 'Part type must be either RAW or ASSEMBLED'
    }),
  description: Joi.string().trim().max(500).optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  parts: Joi.when('type', {
    is: PartType.ASSEMBLED,
    then: Joi.array().min(1).items(
      Joi.object({
        id: Joi.string().uuid().required()
          .messages({
            'string.guid': 'Component part ID must be a valid UUID',
            'any.required': 'Component part ID is required'
          }),
        quantity: Joi.number().integer().min(1).required()
          .messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required'
          })
      })
    ).required()
      .messages({
        'array.min': 'Assembled part must have at least one component',
        'any.required': 'Component parts are required for assembled parts'
      }),
    otherwise: Joi.forbidden()
      .messages({
        'any.unknown': 'Raw parts cannot have components'
      })
  })
});

export const addPartSchema = Joi.object({
  quantity: Joi.number().integer().required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'any.required': 'Quantity is required'
    })
});

// Parameter validation schemas
export const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({
      'string.guid': 'Part ID must be a valid UUID',
      'any.required': 'Part ID is required'
    })
}); 