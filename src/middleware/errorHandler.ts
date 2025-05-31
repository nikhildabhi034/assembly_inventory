import { Request, Response, NextFunction } from 'express';
import { ValidationError, PartNotFoundError, InsufficientQuantityError, CircularDependencyError, DatabaseError } from '../errors/part.errors';
import { ErrorResponse } from '../interfaces/response.interface';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Handle specific error types
  if (error instanceof ValidationError) {
    return res.status(400).json({
      status: 'FAILED',
      message: 'Validation failed',
      errors: [error.message]
    });
  }

  if (error instanceof PartNotFoundError) {
    return res.status(404).json({
      status: 'FAILED',
      message: error.message
    });
  }

  if (error instanceof InsufficientQuantityError) {
    return res.status(400).json({
      status: 'FAILED',
      message: error.message
    });
  }

  if (error instanceof CircularDependencyError) {
    return res.status(400).json({
      status: 'FAILED',
      message: error.message
    });
  }

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      status: 'FAILED',
      message: process.env.NODE_ENV === 'production' 
        ? 'Database error occurred' 
        : error.message
    });
  }

  // Default error response for unhandled errors
  res.status(500).json({
    status: 'FAILED',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
}; 