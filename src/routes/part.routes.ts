import { Router } from 'express';
import { PartController } from '../controllers/PartController';
import { validate, validateCreatePart, validateAddPart } from '../middleware/validateRequest';
import { uuidParamSchema } from '../validations/part.validation';

const router = Router();
const partController = new PartController();

/**
 * Part Management Routes
 */

// Create a new part
router.post(
  '/',
  validateCreatePart,  // Validates the part creation payload
  partController.createPart
);

// Add parts to an existing part
router.post(
  '/:id',
  validateAddPart,  // Validates both the UUID param and quantity payload
  partController.addPart
);

// Get a part by ID
router.get(
  '/:id',
  validate({ params: uuidParamSchema }),  // Validates the UUID param
  partController.getPart
);

// List all parts
router.get(
  '/',
  partController.listParts
);

export default router; 