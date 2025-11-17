import { Router } from 'express';
import * as regulationController from '../controllers/regulation.controller';

const router = Router();

router.get('/', regulationController.getAllRegulations);
router.get('/:id', regulationController.getRegulationById);
router.post('/', regulationController.createRegulation);
router.put('/:id', regulationController.updateRegulation);
router.delete('/:id', regulationController.deleteRegulation);
router.get('/:id/changes', regulationController.getRegulationChanges);
router.post('/:id/changes', regulationController.trackRegulationChange);

export default router;
