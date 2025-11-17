import { Router } from 'express';
import frameworkRoutes from './framework.routes';
import regulationRoutes from './regulation.routes';
import obligationRoutes from './obligation.routes';
import controlRoutes from './control.routes';
import actionRoutes from './action.routes';
import statusRoutes from './status.routes';
import auditRoutes from './audit.routes';
import evidenceRoutes from './evidence.routes';
import riskRoutes from './risk.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// API Routes
router.use('/frameworks', frameworkRoutes);
router.use('/regulations', regulationRoutes);
router.use('/obligations', obligationRoutes);
router.use('/controls', controlRoutes);
router.use('/actions', actionRoutes);
router.use('/status', statusRoutes);
router.use('/audits', auditRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/risks', riskRoutes);
router.use('/dashboard', dashboardRoutes);

// Root route
router.get('/', (req, res) => {
  res.json({
    message: 'Legal Compliance Tracker API',
    version: '1.0.0',
    endpoints: {
      frameworks: '/frameworks',
      regulations: '/regulations',
      obligations: '/obligations',
      controls: '/controls',
      actions: '/actions',
      status: '/status',
      audits: '/audits',
      evidence: '/evidence',
      risks: '/risks',
      dashboard: '/dashboard'
    }
  });
});

export default router;
