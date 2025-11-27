import { Router } from 'express';
import regulationGroupController from '../controllers/regulationGroup.controller';
import { validate } from '../middleware/validate';
import { createRegulationGroupSchema } from '../validators/riskAssessment.validator';

const router = Router();

router.get('/', regulationGroupController.getAll.bind(regulationGroupController));
router.get('/:id', regulationGroupController.getById.bind(regulationGroupController));
router.post('/', validate(createRegulationGroupSchema), regulationGroupController.create.bind(regulationGroupController));
router.put('/:id', regulationGroupController.update.bind(regulationGroupController));
router.delete('/:id', regulationGroupController.delete.bind(regulationGroupController));

export default router;
