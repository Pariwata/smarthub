import { Router } from 'express';
import complianceRiskAreaController from '../controllers/complianceRiskArea.controller';
import { validate } from '../middleware/validate';
import { createComplianceRiskAreaSchema } from '../validators/riskAssessment.validator';

const router = Router();

router.get('/', complianceRiskAreaController.getAll.bind(complianceRiskAreaController));
router.get('/:id', complianceRiskAreaController.getById.bind(complianceRiskAreaController));
router.post('/', validate(createComplianceRiskAreaSchema), complianceRiskAreaController.create.bind(complianceRiskAreaController));
router.put('/:id', complianceRiskAreaController.update.bind(complianceRiskAreaController));
router.delete('/:id', complianceRiskAreaController.delete.bind(complianceRiskAreaController));

export default router;
