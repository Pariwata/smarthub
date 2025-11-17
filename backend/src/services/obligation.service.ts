import prisma from '../config/database';
import { ComplianceObligation } from '@prisma/client';

interface ObligationFilter {
  regulationId?: string;
  priority?: string;
  frequency?: string;
  status?: string;
}

export const getAllObligations = async (filters: ObligationFilter) => {
  const where: any = {};

  if (filters.regulationId) where.regulationId = filters.regulationId;
  if (filters.priority) where.priority = filters.priority;
  if (filters.frequency) where.frequency = filters.frequency;
  if (filters.status !== undefined) where.isActive = filters.status === 'active';

  return await prisma.complianceObligation.findMany({
    where,
    include: {
      regulation: {
        include: {
          framework: true
        }
      },
      statusTracking: {
        take: 1,
        orderBy: { assessmentDate: 'desc' }
      },
      _count: {
        select: {
          controls: true,
          actions: true,
          evidences: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getObligationById = async (id: string) => {
  return await prisma.complianceObligation.findUnique({
    where: { id },
    include: {
      regulation: {
        include: {
          framework: true
        }
      },
      controls: {
        include: {
          testResults: {
            take: 3,
            orderBy: { testDate: 'desc' }
          }
        }
      },
      actions: {
        orderBy: { dueDate: 'asc' }
      },
      statusTracking: {
        orderBy: { assessmentDate: 'desc' }
      },
      evidences: true,
      risks: true
    }
  });
};

export const createObligation = async (data: Partial<ComplianceObligation>) => {
  return await prisma.complianceObligation.create({
    data: data as any,
    include: {
      regulation: true
    }
  });
};

export const updateObligation = async (id: string, data: Partial<ComplianceObligation>) => {
  return await prisma.complianceObligation.update({
    where: { id },
    data,
    include: {
      regulation: true
    }
  });
};

export const deleteObligation = async (id: string) => {
  return await prisma.complianceObligation.delete({
    where: { id }
  });
};

export const getObligationCompliance = async (id: string) => {
  const obligation = await prisma.complianceObligation.findUnique({
    where: { id },
    include: {
      regulation: true,
      controls: true,
      actions: true,
      statusTracking: {
        take: 1,
        orderBy: { assessmentDate: 'desc' }
      },
      evidences: {
        where: { isVerified: true }
      }
    }
  });

  if (!obligation) {
    throw new Error('Obligation not found');
  }

  const latestStatus = obligation.statusTracking[0];
  const totalActions = obligation.actions.length;
  const completedActions = obligation.actions.filter(a => a.status === 'COMPLETED').length;
  const overdueActions = obligation.actions.filter(a =>
    a.status !== 'COMPLETED' && new Date(a.dueDate) < new Date()
  ).length;

  return {
    obligation: {
      id: obligation.id,
      obligationCode: obligation.obligationCode,
      title: obligation.title,
      priority: obligation.priority
    },
    complianceStatus: latestStatus?.status || 'NOT_ASSESSED',
    complianceScore: latestStatus?.complianceScore || 0,
    lastAssessmentDate: latestStatus?.assessmentDate,
    controls: {
      total: obligation.controls.length,
      effective: obligation.controls.filter(c => c.isEffective).length
    },
    actions: {
      total: totalActions,
      completed: completedActions,
      inProgress: obligation.actions.filter(a => a.status === 'IN_PROGRESS').length,
      overdue: overdueActions,
      completionRate: totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0
    },
    evidence: {
      total: obligation.evidences.length,
      verified: obligation.evidences.filter(e => e.isVerified).length
    }
  };
};
