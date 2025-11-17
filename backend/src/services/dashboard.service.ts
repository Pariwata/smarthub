import prisma from '../config/database';
import { addDays } from 'date-fns';

export const getOverview = async () => {
  const [
    totalFrameworks,
    totalRegulations,
    totalObligations,
    totalActions,
    activeFrameworks,
    activeRegulations,
    completedActions,
    overdueActions
  ] = await Promise.all([
    prisma.complianceFramework.count(),
    prisma.regulatoryLibrary.count(),
    prisma.complianceObligation.count(),
    prisma.complianceAction.count(),
    prisma.complianceFramework.count({ where: { isActive: true } }),
    prisma.regulatoryLibrary.count({ where: { status: 'ACTIVE' } }),
    prisma.complianceAction.count({ where: { status: 'COMPLETED' } }),
    prisma.complianceAction.count({
      where: {
        status: { not: 'COMPLETED' },
        dueDate: { lt: new Date() }
      }
    })
  ]);

  return {
    frameworks: { total: totalFrameworks, active: activeFrameworks },
    regulations: { total: totalRegulations, active: activeRegulations },
    obligations: { total: totalObligations },
    actions: {
      total: totalActions,
      completed: completedActions,
      overdue: overdueActions,
      completionRate: totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0
    }
  };
};

export const getComplianceMetrics = async () => {
  const statuses = await prisma.complianceStatus.groupBy({
    by: ['status'],
    _count: true,
    orderBy: {
      _count: {
        status: 'desc'
      }
    }
  });

  const total = statuses.reduce((sum, s) => sum + s._count, 0);

  return {
    statusDistribution: statuses.map(s => ({
      status: s.status,
      count: s._count,
      percentage: total > 0 ? Math.round((s._count / total) * 100) : 0
    })),
    total
  };
};

export const getUpcomingDeadlines = async (days: number = 30) => {
  const endDate = addDays(new Date(), days);

  const actions = await prisma.complianceAction.findMany({
    where: {
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
      dueDate: {
        gte: new Date(),
        lte: endDate
      }
    },
    include: {
      obligation: {
        include: {
          regulation: {
            include: {
              framework: true
            }
          }
        }
      }
    },
    orderBy: { dueDate: 'asc' },
    take: 20
  });

  return actions.map(action => ({
    id: action.id,
    actionCode: action.actionCode,
    title: action.title,
    dueDate: action.dueDate,
    status: action.status,
    assignedTo: action.assignedTo,
    obligation: {
      title: action.obligation.title,
      priority: action.obligation.priority
    },
    regulation: action.obligation.regulation.title,
    framework: action.obligation.regulation.framework?.name || 'N/A',
    daysUntilDue: Math.ceil(
      (new Date(action.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  }));
};

export const getRecentChanges = async (limit: number = 10) => {
  const changes = await prisma.regulatoryChange.findMany({
    take: limit,
    include: {
      regulation: {
        include: {
          framework: true
        }
      }
    },
    orderBy: { changeDate: 'desc' }
  });

  return changes.map(change => ({
    id: change.id,
    changeType: change.changeType,
    changeDate: change.changeDate,
    effectiveDate: change.effectiveDate,
    description: change.description,
    actionRequired: change.actionRequired,
    regulation: {
      title: change.regulation.title,
      code: change.regulation.code
    },
    framework: change.regulation.framework?.name || 'N/A'
  }));
};

export const getRiskHeatmap = async () => {
  const risks = await prisma.riskAssessment.groupBy({
    by: ['likelihood', 'impact'],
    _count: true
  });

  return risks.map(risk => ({
    likelihood: risk.likelihood,
    impact: risk.impact,
    count: risk._count
  }));
};

export const getComplianceByFramework = async () => {
  const frameworks = await prisma.complianceFramework.findMany({
    where: { isActive: true },
    include: {
      regulations: {
        include: {
          obligations: {
            include: {
              statusTracking: {
                take: 1,
                orderBy: { assessmentDate: 'desc' }
              }
            }
          }
        }
      }
    }
  });

  return frameworks.map(framework => {
    const obligations = framework.regulations.flatMap(r => r.obligations);
    const totalObligations = obligations.length;

    let compliant = 0;
    let partiallyCompliant = 0;
    let nonCompliant = 0;

    obligations.forEach(obl => {
      const latestStatus = obl.statusTracking[0];
      if (latestStatus) {
        if (latestStatus.status === 'COMPLIANT') compliant++;
        else if (latestStatus.status === 'PARTIALLY_COMPLIANT') partiallyCompliant++;
        else if (latestStatus.status === 'NON_COMPLIANT') nonCompliant++;
      }
    });

    const complianceRate = totalObligations > 0
      ? Math.round((compliant / totalObligations) * 100)
      : 0;

    return {
      framework: {
        id: framework.id,
        code: framework.code,
        name: framework.name,
        category: framework.category
      },
      metrics: {
        totalObligations,
        compliant,
        partiallyCompliant,
        nonCompliant,
        complianceRate
      }
    };
  });
};
