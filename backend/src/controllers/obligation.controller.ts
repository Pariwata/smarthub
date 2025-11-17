import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import * as obligationService from '../services/obligation.service';

export const getAllObligations = asyncHandler(async (req: Request, res: Response) => {
  const { regulationId, priority, frequency, status } = req.query;
  const obligations = await obligationService.getAllObligations({
    regulationId: regulationId as string,
    priority: priority as string,
    frequency: frequency as string,
    status: status as string
  });

  res.json({
    success: true,
    data: obligations
  });
});

export const getObligationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const obligation = await obligationService.getObligationById(id);

  if (!obligation) {
    throw new AppError('Obligation not found', 404);
  }

  res.json({
    success: true,
    data: obligation
  });
});

export const createObligation = asyncHandler(async (req: Request, res: Response) => {
  const obligation = await obligationService.createObligation(req.body);

  res.status(201).json({
    success: true,
    data: obligation,
    message: 'Obligation created successfully'
  });
});

export const updateObligation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const obligation = await obligationService.updateObligation(id, req.body);

  res.json({
    success: true,
    data: obligation,
    message: 'Obligation updated successfully'
  });
});

export const deleteObligation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await obligationService.deleteObligation(id);

  res.json({
    success: true,
    message: 'Obligation deleted successfully'
  });
});

export const getObligationCompliance = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const compliance = await obligationService.getObligationCompliance(id);

  res.json({
    success: true,
    data: compliance
  });
});
