import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as dashboardService from '../services/dashboard.service';

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const overview = await dashboardService.getOverview();

  res.json({
    success: true,
    data: overview
  });
});

export const getComplianceMetrics = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await dashboardService.getComplianceMetrics();

  res.json({
    success: true,
    data: metrics
  });
});

export const getUpcomingDeadlines = asyncHandler(async (req: Request, res: Response) => {
  const { days = 30 } = req.query;
  const deadlines = await dashboardService.getUpcomingDeadlines(Number(days));

  res.json({
    success: true,
    data: deadlines
  });
});

export const getRecentChanges = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;
  const changes = await dashboardService.getRecentChanges(Number(limit));

  res.json({
    success: true,
    data: changes
  });
});

export const getRiskHeatmap = asyncHandler(async (req: Request, res: Response) => {
  const heatmap = await dashboardService.getRiskHeatmap();

  res.json({
    success: true,
    data: heatmap
  });
});

export const getComplianceByFramework = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getComplianceByFramework();

  res.json({
    success: true,
    data
  });
});
