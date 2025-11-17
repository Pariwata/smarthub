import prisma from '../config/database';
import { ComplianceAction, ActionStatus } from '@prisma/client';

interface ActionFilter {
  obligationId?: string;
  status?: string;
  assignedTo?: string;
}

export const getAllActions = async (filters: ActionFilter) => {
  const where: any = {};

  if (filters.obligationId) where.obligationId = filters.obligationId;
  if (filters.status) where.status = filters.status;
  if (filters.assignedTo) where.assignedTo = filters.assignedTo;

  return await prisma.complianceAction.findMany({
    where,
    include: {
      obligation: {
        include: {
          regulation: true
        }
      },
      control: true,
      _count: {
        select: {
          updates: true,
          evidences: true
        }
      }
    },
    orderBy: { dueDate: 'asc' }
  });
};

export const getActionById = async (id: string) => {
  return await prisma.complianceAction.findUnique({
    where: { id },
    include: {
      obligation: {
        include: {
          regulation: true
        }
      },
      control: true,
      updates: {
        orderBy: { updateDate: 'desc' }
      },
      evidences: true
    }
  });
};

export const createAction = async (data: Partial<ComplianceAction>) => {
  return await prisma.complianceAction.create({
    data: data as any,
    include: {
      obligation: true,
      control: true
    }
  });
};

export const updateAction = async (id: string, data: Partial<ComplianceAction>) => {
  return await prisma.complianceAction.update({
    where: { id },
    data,
    include: {
      obligation: true,
      control: true
    }
  });
};

export const deleteAction = async (id: string) => {
  return await prisma.complianceAction.delete({
    where: { id }
  });
};

export const updateActionStatus = async (
  id: string,
  status: ActionStatus,
  updatedBy: string,
  notes?: string
) => {
  const currentAction = await prisma.complianceAction.findUnique({
    where: { id }
  });

  if (!currentAction) {
    throw new Error('Action not found');
  }

  const [updatedAction] = await prisma.$transaction([
    prisma.complianceAction.update({
      where: { id },
      data: { status },
      include: {
        obligation: true,
        control: true
      }
    }),
    prisma.actionUpdate.create({
      data: {
        actionId: id,
        updatedBy,
        statusBefore: currentAction.status,
        statusAfter: status,
        notes
      }
    })
  ]);

  return updatedAction;
};
