import Joi from 'joi';
import { LikelihoodLevel, ImpactLevel, QRMLevel } from '../types/enums';

export const createRiskAssessmentSchema = Joi.object({
  riskAreaId: Joi.number().integer().positive().required(),
  assessmentPeriod: Joi.string().required()
    .pattern(/^\d{4}-(Q[1-4]|H[1-2]|M(0[1-9]|1[0-2]))$/)
    .messages({
      'string.pattern.base': 'Assessment period must be in format YYYY-Q1, YYYY-H1, or YYYY-M01'
    }),
  likelihoodLevel: Joi.number().integer().min(1).max(5).required(),
  impactLevel: Joi.number().integer().min(1).max(5).required(),
  qrmLevel: Joi.number().integer().min(1).max(5).required(),
  // Risk Description Indicators
  hasIncompleteActionPlanForNewRegulation: Joi.boolean().allow(null),
  hasIncompleteCorrectiveActionPlan: Joi.boolean().allow(null),
  hasNewOrComplexRegulation: Joi.boolean().allow(null),
  riskDescriptionOther: Joi.string().allow('', null),
  likelihoodJustification: Joi.string().allow('', null),
  impactJustification: Joi.string().allow('', null),
  qrmJustification: Joi.string().allow('', null),
  mitigationActions: Joi.string().allow('', null),
  assessedBy: Joi.string().allow('', null),
  assessedDate: Joi.date().iso().allow(null),
  status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected').default('draft')
});

export const updateRiskAssessmentSchema = Joi.object({
  riskAreaId: Joi.number().integer().positive(),
  assessmentPeriod: Joi.string()
    .pattern(/^\d{4}-(Q[1-4]|H[1-2]|M(0[1-9]|1[0-2]))$/),
  likelihoodLevel: Joi.number().integer().min(1).max(5),
  impactLevel: Joi.number().integer().min(1).max(5),
  qrmLevel: Joi.number().integer().min(1).max(5),
  // Risk Description Indicators
  hasIncompleteActionPlanForNewRegulation: Joi.boolean().allow(null),
  hasIncompleteCorrectiveActionPlan: Joi.boolean().allow(null),
  hasNewOrComplexRegulation: Joi.boolean().allow(null),
  riskDescriptionOther: Joi.string().allow('', null),
  likelihoodJustification: Joi.string().allow('', null),
  impactJustification: Joi.string().allow('', null),
  qrmJustification: Joi.string().allow('', null),
  mitigationActions: Joi.string().allow('', null),
  assessedBy: Joi.string().allow('', null),
  assessedDate: Joi.date().iso().allow(null),
  reviewedBy: Joi.string().allow('', null),
  reviewedDate: Joi.date().iso().allow(null),
  status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected')
}).min(1);

export const createRegulationGroupSchema = Joi.object({
  code: Joi.string().max(50).required(),
  nameTh: Joi.string().max(255).required(),
  nameEn: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  isActive: Joi.boolean().default(true)
});

export const createComplianceRiskAreaSchema = Joi.object({
  regulationGroupId: Joi.number().integer().positive().required(),
  code: Joi.string().max(50).required(),
  nameTh: Joi.string().max(255).required(),
  nameEn: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  isActive: Joi.boolean().default(true)
});
