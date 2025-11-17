import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import * as regulationService from '../services/regulation.service';

export const getAllRegulations = asyncHandler(async (req: Request, res: Response) => {
  const { frameworkId, status, type } = req.query;
  const regulations = await regulationService.getAllRegulations({
    frameworkId: frameworkId as string,
    status: status as string,
    type: type as string
  });

  res.json({
    success: true,
    data: regulations
  });
});

export const getRegulationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const regulation = await regulationService.getRegulationById(id);

  if (!regulation) {
    throw new AppError('Regulation not found', 404);
  }

  res.json({
    success: true,
    data: regulation
  });
});

export const createRegulation = asyncHandler(async (req: Request, res: Response) => {
  const regulation = await regulationService.createRegulation(req.body);

  res.status(201).json({
    success: true,
    data: regulation,
    message: 'Regulation created successfully'
  });
});

export const updateRegulation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const regulation = await regulationService.updateRegulation(id, req.body);

  res.json({
    success: true,
    data: regulation,
    message: 'Regulation updated successfully'
  });
});

export const deleteRegulation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await regulationService.deleteRegulation(id);

  res.json({
    success: true,
    message: 'Regulation deleted successfully'
  });
});

export const getRegulationChanges = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const changes = await regulationService.getRegulationChanges(id);

  res.json({
    success: true,
    data: changes
  });
});

export const trackRegulationChange = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const change = await regulationService.trackRegulationChange(id, req.body);

  res.status(201).json({
    success: true,
    data: change,
    message: 'Regulation change tracked successfully'
  });
});
