import { Router } from 'express';
import * as obligationController from '../controllers/obligation.controller';

const router = Router();

router.get('/', obligationController.getAllObligations);
router.get('/:id', obligationController.getObligationById);
router.post('/', obligationController.createObligation);
router.put('/:id', obligationController.updateObligation);
router.delete('/:id', obligationController.deleteObligation);
router.get('/:id/compliance', obligationController.getObligationCompliance);

export default router;
