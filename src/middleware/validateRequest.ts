import { Request, Response, NextFunction } from 'express';
import { Schema, ValidationErrorItem } from 'joi';
import { ValidationError } from '../errors/part.errors';
import { createPartSchema, addPartSchema, uuidParamSchema } from '../validations/part.validation';

interface ValidationOptions {
  body?: Schema;
  query?: Schema;
  params?: Schema;
}

export const validate = (schema: ValidationOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.params) {
        const { error } = schema.params.validate(req.params, { abortEarly: false });
        if (error) {
          throw new ValidationError(error.details.map((detail: ValidationErrorItem) => detail.message).join(', '));
        }
      }

      if (schema.query) {
        const { error } = schema.query.validate(req.query, { abortEarly: false });
        if (error) {
          throw new ValidationError(error.details.map((detail: ValidationErrorItem) => detail.message).join(', '));
        }
      }

      if (schema.body) {
        const { error } = schema.body.validate(req.body, { abortEarly: false });
        if (error) {
          throw new ValidationError(error.details.map((detail: ValidationErrorItem) => detail.message).join(', '));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Pre-configured validation middlewares
export const validateCreatePart = validate({
  body: createPartSchema
});

export const validateAddPart = validate({
  params: uuidParamSchema,
  body: addPartSchema
}); 