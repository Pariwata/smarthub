import prisma from '../config/database';
import { ComplianceFramework } from '@prisma/client';

export const getAllFrameworks = async () => {
  return await prisma.complianceFramework.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          regulations: true,
          audits: true
        }
      }
    }
  });
};

export const getFrameworkById = async (id: string) => {
  return await prisma.complianceFramework.findUnique({
    where: { id },
    include: {
      regulations: {
        take: 10,
        orderBy: { effectiveDate: 'desc' }
      },
      audits: {
        take: 5,
        orderBy: { plannedStartDate: 'desc' }
      },
      _count: {
        select: {
          regulations: true,
          audits: true
        }
      }
    }
  });
};

export const createFramework = async (data: Partial<ComplianceFramework>) => {
  return await prisma.complianceFramework.create({
    data: data as any
  });
};

export const updateFramework = async (id: string, data: Partial<ComplianceFramework>) => {
  return await prisma.complianceFramework.update({
    where: { id },
    data
  });
};

export const deleteFramework = async (id: string) => {
  return await prisma.complianceFramework.delete({
    where: { id }
  });
};

export const getFrameworkStats = async (id: string) => {
  const framework = await prisma.complianceFramework.findUnique({
    where: { id },
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
      },
      audits: true
    }
  });

  if (!framework) {
    throw new Error('Framework not found');
  }

  const totalRegulations = framework.regulations.length;
  const totalObligations = framework.regulations.reduce(
    (sum, reg) => sum + reg.obligations.length,
    0
  );

  // Count compliance status
  let compliant = 0;
  let partiallyCompliant = 0;
  let nonCompliant = 0;

  framework.regulations.forEach(reg => {
    reg.obligations.forEach(obl => {
      const latestStatus = obl.statusTracking[0];
      if (latestStatus) {
        if (latestStatus.status === 'COMPLIANT') compliant++;
        else if (latestStatus.status === 'PARTIALLY_COMPLIANT') partiallyCompliant++;
        else if (latestStatus.status === 'NON_COMPLIANT') nonCompliant++;
      }
    });
  });

  const complianceRate = totalObligations > 0
    ? Math.round((compliant / totalObligations) * 100)
    : 0;

  return {
    framework: {
      id: framework.id,
      code: framework.code,
      name: framework.name
    },
    statistics: {
      totalRegulations,
      totalObligations,
      totalAudits: framework.audits.length,
      complianceStatus: {
        compliant,
        partiallyCompliant,
        nonCompliant,
        complianceRate
      }
    }
  };
};
