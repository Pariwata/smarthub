import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get('/overview', dashboardController.getOverview);
router.get('/metrics', dashboardController.getComplianceMetrics);
router.get('/deadlines', dashboardController.getUpcomingDeadlines);
router.get('/recent-changes', dashboardController.getRecentChanges);
router.get('/risk-heatmap', dashboardController.getRiskHeatmap);
router.get('/compliance-by-framework', dashboardController.getComplianceByFramework);

export default router;
