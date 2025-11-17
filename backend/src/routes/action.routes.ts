import { Router } from 'express';
import * as actionController from '../controllers/action.controller';

const router = Router();

router.get('/', actionController.getAllActions);
router.get('/:id', actionController.getActionById);
router.post('/', actionController.createAction);
router.put('/:id', actionController.updateAction);
router.delete('/:id', actionController.deleteAction);
router.patch('/:id/status', actionController.updateActionStatus);

export default router;
