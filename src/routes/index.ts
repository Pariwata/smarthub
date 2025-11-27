import { Router } from 'express';
import regulationGroupRoutes from './regulationGroup.routes';
import complianceRiskAreaRoutes from './complianceRiskArea.routes';
import riskAssessmentRoutes from './riskAssessment.routes';

const router = Router();

router.use('/regulation-groups', regulationGroupRoutes);
router.use('/compliance-risk-areas', complianceRiskAreaRoutes);
router.use('/risk-assessments', riskAssessmentRoutes);

export default router;
