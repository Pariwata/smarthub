import { Router } from 'express';
import * as frameworkController from '../controllers/framework.controller';

const router = Router();

router.get('/', frameworkController.getAllFrameworks);
router.get('/:id', frameworkController.getFrameworkById);
router.post('/', frameworkController.createFramework);
router.put('/:id', frameworkController.updateFramework);
router.delete('/:id', frameworkController.deleteFramework);
router.get('/:id/stats', frameworkController.getFrameworkStats);

export default router;
