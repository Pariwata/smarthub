import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import * as frameworkService from '../services/framework.service';

// Get all compliance frameworks
export const getAllFrameworks = asyncHandler(async (req: Request, res: Response) => {
  const frameworks = await frameworkService.getAllFrameworks();
  res.json({
    success: true,
    data: frameworks
  });
});

// Get framework by ID
export const getFrameworkById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const framework = await frameworkService.getFrameworkById(id);

  if (!framework) {
    throw new AppError('Framework not found', 404);
  }

  res.json({
    success: true,
    data: framework
  });
});

// Create new framework
export const createFramework = asyncHandler(async (req: Request, res: Response) => {
  const framework = await frameworkService.createFramework(req.body);
  res.status(201).json({
    success: true,
    data: framework,
    message: 'Framework created successfully'
  });
});

// Update framework
export const updateFramework = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const framework = await frameworkService.updateFramework(id, req.body);

  res.json({
    success: true,
    data: framework,
    message: 'Framework updated successfully'
  });
});

// Delete framework
export const deleteFramework = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await frameworkService.deleteFramework(id);

  res.json({
    success: true,
    message: 'Framework deleted successfully'
  });
});

// Get framework statistics
export const getFrameworkStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const stats = await frameworkService.getFrameworkStats(id);

  res.json({
    success: true,
    data: stats
  });
});
