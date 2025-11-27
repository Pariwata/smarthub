import { Router } from 'express';
import riskAssessmentController from '../controllers/riskAssessment.controller';
import { validate } from '../middleware/validate';
import { createRiskAssessmentSchema, updateRiskAssessmentSchema } from '../validators/riskAssessment.validator';

const router = Router();

// Risk Matrix and Statistics
router.get('/matrix', riskAssessmentController.getRiskMatrix.bind(riskAssessmentController));
router.get('/statistics', riskAssessmentController.getStatistics.bind(riskAssessmentController));

// CRUD operations
router.get('/', riskAssessmentController.getAll.bind(riskAssessmentController));
router.get('/:id', riskAssessmentController.getById.bind(riskAssessmentController));
router.post('/', validate(createRiskAssessmentSchema), riskAssessmentController.create.bind(riskAssessmentController));
router.put('/:id', validate(updateRiskAssessmentSchema), riskAssessmentController.update.bind(riskAssessmentController));
router.delete('/:id', riskAssessmentController.delete.bind(riskAssessmentController));

export default router;
