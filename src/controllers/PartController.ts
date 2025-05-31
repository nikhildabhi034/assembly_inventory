import { Request, Response, NextFunction } from 'express';
import { PartService } from '../services/PartService';
import { CreatePartData, InventoryResponse, PartWithComponents } from '../interfaces/part.interface';
import { ApiResponse } from '../interfaces/response.interface';
import { Part } from '../models/Part';
import { PartNotFoundError } from '../errors/part.errors';

export class PartController {
  private partService = new PartService();

  createPart = async (
    req: Request<{}, {}, CreatePartData>,
    res: Response<ApiResponse<Part>>,
    next: NextFunction
  ) => {
    try {
      const part = await this.partService.createPart(req.body);
      res.status(201).json({
        status: 'SUCCESS',
        data: part,
        message: 'Part created successfully'
      });
    } catch (error) {
      // Error handling is now done by the errorHandler middleware
      next(error);
    }
  };

  addPart = async (
    req: Request<{ id: string }, {}, { quantity: number }>,
    res: Response<ApiResponse<InventoryResponse>>,
    next: NextFunction
  ) => {
    try {
      const result = await this.partService.addPart(req.params.id, req.body.quantity);
      res.status(200).json({
        status: result.status,
        message: result.message || 'Inventory updated successfully'
      });
    } catch (error) {
      // Error handling is now done by the errorHandler middleware
      next(error);
    }
  };

  getPart = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<PartWithComponents>>,
    next: NextFunction
  ) => {
    try {
      const part = await this.partService.getPart(req.params.id);
      if (!part) {
        throw new PartNotFoundError(req.params.id);
      }
      res.status(200).json({
        status: 'SUCCESS',
        data: part,
        message: 'Part retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  listParts = async (
    req: Request,
    res: Response<ApiResponse<PartWithComponents[]>>,
    next: NextFunction
  ) => {
    try {
      const parts = await this.partService.listParts();
      res.status(200).json({
        status: 'SUCCESS',
        data: parts,
        message: 'Parts retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  };
} 