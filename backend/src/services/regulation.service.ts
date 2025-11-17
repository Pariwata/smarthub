import prisma from '../config/database';
import { RegulatoryLibrary, RegulatoryChange } from '@prisma/client';

interface RegulationFilter {
  frameworkId?: string;
  status?: string;
  type?: string;
}

export const getAllRegulations = async (filters: RegulationFilter) => {
  const where: any = {};

  if (filters.frameworkId) where.frameworkId = filters.frameworkId;
  if (filters.status) where.status = filters.status;
  if (filters.type) where.regulationType = filters.type;

  return await prisma.regulatoryLibrary.findMany({
    where,
    include: {
      framework: true,
      _count: {
        select: {
          obligations: true,
          changeHistory: true
        }
      }
    },
    orderBy: { effectiveDate: 'desc' }
  });
};

export const getRegulationById = async (id: string) => {
  return await prisma.regulatoryLibrary.findUnique({
    where: { id },
    include: {
      framework: true,
      obligations: {
        include: {
          statusTracking: {
            take: 1,
            orderBy: { assessmentDate: 'desc' }
          }
        }
      },
      changeHistory: {
        orderBy: { changeDate: 'desc' }
      }
    }
  });
};

export const createRegulation = async (data: Partial<RegulatoryLibrary>) => {
  return await prisma.regulatoryLibrary.create({
    data: data as any,
    include: {
      framework: true
    }
  });
};

export const updateRegulation = async (id: string, data: Partial<RegulatoryLibrary>) => {
  return await prisma.regulatoryLibrary.update({
    where: { id },
    data,
    include: {
      framework: true
    }
  });
};

export const deleteRegulation = async (id: string) => {
  return await prisma.regulatoryLibrary.delete({
    where: { id }
  });
};

export const getRegulationChanges = async (regulationId: string) => {
  return await prisma.regulatoryChange.findMany({
    where: { regulationId },
    orderBy: { changeDate: 'desc' }
  });
};

export const trackRegulationChange = async (
  regulationId: string,
  data: Partial<RegulatoryChange>
) => {
  return await prisma.regulatoryChange.create({
    data: {
      ...data,
      regulationId
    } as any
  });
};
