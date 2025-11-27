import { Request, Response } from 'express';
import { RiskAssessment, ComplianceRiskArea, RegulationGroup } from '../models';
import { calculateInherentRisk, calculateNetRisk } from '../models/RiskAssessment';

export class RiskAssessmentController {
  /**
   * Get all risk assessments with filtering options
   */
  async getAll(req: Request, res: Response) {
    try {
      const { riskAreaId, assessmentPeriod, status } = req.query;

      const where: any = {};
      if (riskAreaId) where.riskAreaId = riskAreaId;
      if (assessmentPeriod) where.assessmentPeriod = assessmentPeriod;
      if (status) where.status = status;

      const assessments = await RiskAssessment.findAll({
        where,
        include: [
          {
            model: ComplianceRiskArea,
            as: 'riskArea',
            include: [
              {
                model: RegulationGroup,
                as: 'regulationGroup'
              }
            ]
          }
        ],
        order: [['assessedDate', 'DESC'], ['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: assessments
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching risk assessments',
        error: error.message
      });
    }
  }

  /**
   * Get a single risk assessment by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const assessment = await RiskAssessment.findByPk(id, {
        include: [
          {
            model: ComplianceRiskArea,
            as: 'riskArea',
            include: [
              {
                model: RegulationGroup,
                as: 'regulationGroup'
              }
            ]
          }
        ]
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Risk assessment not found'
        });
      }

      res.json({
        success: true,
        data: assessment
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching risk assessment',
        error: error.message
      });
    }
  }

  /**
   * Create a new risk assessment
   */
  async create(req: Request, res: Response) {
    try {
      const assessment = await RiskAssessment.create(req.body);

      const fullAssessment = await RiskAssessment.findByPk(assessment.id, {
        include: [
          {
            model: ComplianceRiskArea,
            as: 'riskArea',
            include: [
              {
                model: RegulationGroup,
                as: 'regulationGroup'
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Risk assessment created successfully',
        data: fullAssessment
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Error creating risk assessment',
        error: error.message
      });
    }
  }

  /**
   * Update a risk assessment
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const assessment = await RiskAssessment.findByPk(id);
      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Risk assessment not found'
        });
      }

      await assessment.update(req.body);

      const updatedAssessment = await RiskAssessment.findByPk(id, {
        include: [
          {
            model: ComplianceRiskArea,
            as: 'riskArea',
            include: [
              {
                model: RegulationGroup,
                as: 'regulationGroup'
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        message: 'Risk assessment updated successfully',
        data: updatedAssessment
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Error updating risk assessment',
        error: error.message
      });
    }
  }

  /**
   * Delete a risk assessment
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const assessment = await RiskAssessment.findByPk(id);
      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Risk assessment not found'
        });
      }

      await assessment.destroy();

      res.json({
        success: true,
        message: 'Risk assessment deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error deleting risk assessment',
        error: error.message
      });
    }
  }

  /**
   * Get risk matrix
   */
  async getRiskMatrix(req: Request, res: Response) {
    try {
      const matrix = [];

      // Generate 5x5 matrix showing all combinations
      for (let likelihood = 5; likelihood >= 1; likelihood--) {
        const row = [];
        for (let impact = 1; impact <= 5; impact++) {
          const inherentRisk = calculateInherentRisk(likelihood, impact);
          row.push({
            likelihood,
            impact,
            inherentRisk,
            // Examples with different QRM levels
            netRiskExcellentQRM: calculateNetRisk(inherentRisk, 5),
            netRiskGoodQRM: calculateNetRisk(inherentRisk, 4),
            netRiskFairQRM: calculateNetRisk(inherentRisk, 3),
            netRiskWeakQRM: calculateNetRisk(inherentRisk, 1)
          });
        }
        matrix.push(row);
      }

      res.json({
        success: true,
        data: {
          matrix,
          legend: {
            likelihood: {
              1: { th: 'น้อยมาก', en: 'Very Low', percentage: '≤2%' },
              2: { th: 'น้อย', en: 'Low', percentage: '2%-5%' },
              3: { th: 'ปานกลาง', en: 'Medium', percentage: '5%-10%' },
              4: { th: 'ค่อนข้างสูง', en: 'High', percentage: '10%-20%' },
              5: { th: 'รุนแรงที่สุด', en: 'Very High', percentage: '>20%' }
            },
            impact: {
              1: { th: 'น้อยมาก', en: 'Very Low' },
              2: { th: 'น้อย', en: 'Low' },
              3: { th: 'ปานกลาง', en: 'Medium' },
              4: { th: 'ค่อนข้างสูง', en: 'High' },
              5: { th: 'สูงมาก', en: 'Very High' }
            },
            netRisk: {
              1: { th: 'ต่ำ', en: 'Low', color: 'green' },
              2: { th: 'ปานกลาง', en: 'Medium', color: 'yellow' },
              3: { th: 'ค่อนข้างสูง', en: 'Quite High', color: 'orange' },
              4: { th: 'สูง', en: 'High', color: 'red' }
            },
            qrm: {
              1: { th: 'อ่อน', en: 'Weak', color: 'red' },
              2: { th: 'ค่อนข้างอ่อน', en: 'Somewhat Weak', color: 'orange' },
              3: { th: 'พอใช้', en: 'Fair', color: 'yellow' },
              4: { th: 'ค่อนข้างดี', en: 'Good', color: 'lightgreen' },
              5: { th: 'ดี', en: 'Excellent', color: 'darkgreen' }
            }
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error generating risk matrix',
        error: error.message
      });
    }
  }

  /**
   * Get risk assessment statistics/dashboard
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const { assessmentPeriod } = req.query;

      const where: any = {};
      if (assessmentPeriod) where.assessmentPeriod = assessmentPeriod;

      const assessments = await RiskAssessment.findAll({
        where,
        include: [
          {
            model: ComplianceRiskArea,
            as: 'riskArea',
            include: [
              {
                model: RegulationGroup,
                as: 'regulationGroup'
              }
            ]
          }
        ]
      });

      const statistics = {
        total: assessments.length,
        byNetRisk: {
          low: assessments.filter(a => a.netRisk === 1).length,
          medium: assessments.filter(a => a.netRisk === 2).length,
          quiteHigh: assessments.filter(a => a.netRisk === 3).length,
          high: assessments.filter(a => a.netRisk === 4).length
        },
        byQRM: {
          weak: assessments.filter(a => a.qrmLevel === 1).length,
          somewhatWeak: assessments.filter(a => a.qrmLevel === 2).length,
          fair: assessments.filter(a => a.qrmLevel === 3).length,
          good: assessments.filter(a => a.qrmLevel === 4).length,
          excellent: assessments.filter(a => a.qrmLevel === 5).length
        },
        byStatus: {
          draft: assessments.filter(a => a.status === 'draft').length,
          submitted: assessments.filter(a => a.status === 'submitted').length,
          approved: assessments.filter(a => a.status === 'approved').length,
          rejected: assessments.filter(a => a.status === 'rejected').length
        },
        highRiskAreas: assessments
          .filter(a => a.netRisk >= 3)
          .map(a => ({
            id: a.id,
            riskArea: a.riskArea?.nameTh,
            netRisk: a.netRisk,
            assessmentPeriod: a.assessmentPeriod
          }))
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }
}

export default new RiskAssessmentController();
