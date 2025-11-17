import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import * as actionService from '../services/action.service';

export const getAllActions = asyncHandler(async (req: Request, res: Response) => {
  const { obligationId, status, assignedTo } = req.query;
  const actions = await actionService.getAllActions({
    obligationId: obligationId as string,
    status: status as string,
    assignedTo: assignedTo as string
  });

  res.json({
    success: true,
    data: actions
  });
});

export const getActionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const action = await actionService.getActionById(id);

  if (!action) {
    throw new AppError('Action not found', 404);
  }

  res.json({
    success: true,
    data: action
  });
});

export const createAction = asyncHandler(async (req: Request, res: Response) => {
  const action = await actionService.createAction(req.body);

  res.status(201).json({
    success: true,
    data: action,
    message: 'Action created successfully'
  });
});

export const updateAction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const action = await actionService.updateAction(id, req.body);

  res.json({
    success: true,
    data: action,
    message: 'Action updated successfully'
  });
});

export const deleteAction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await actionService.deleteAction(id);

  res.json({
    success: true,
    message: 'Action deleted successfully'
  });
});

export const updateActionStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, updatedBy, notes } = req.body;

  const action = await actionService.updateActionStatus(id, status, updatedBy, notes);

  res.json({
    success: true,
    data: action,
    message: 'Action status updated successfully'
  });
});
