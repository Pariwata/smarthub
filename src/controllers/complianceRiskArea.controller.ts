import { Request, Response } from 'express';
import { ComplianceRiskArea, RegulationGroup, RiskAssessment } from '../models';

export class ComplianceRiskAreaController {
  async getAll(req: Request, res: Response) {
    try {
      const { regulationGroupId } = req.query;

      const where: any = {};
      if (regulationGroupId) where.regulationGroupId = regulationGroupId;

      const riskAreas = await ComplianceRiskArea.findAll({
        where,
        include: [
          {
            model: RegulationGroup,
            as: 'regulationGroup'
          }
        ],
        order: [['code', 'ASC']]
      });

      res.json({
        success: true,
        data: riskAreas
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching compliance risk areas',
        error: error.message
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const riskArea = await ComplianceRiskArea.findByPk(id, {
        include: [
          {
            model: RegulationGroup,
            as: 'regulationGroup'
          },
          {
            model: RiskAssessment,
            as: 'assessments',
            limit: 10,
            order: [['assessedDate', 'DESC']]
          }
        ]
      });

      if (!riskArea) {
        return res.status(404).json({
          success: false,
          message: 'Compliance risk area not found'
        });
      }

      res.json({
        success: true,
        data: riskArea
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching compliance risk area',
        error: error.message
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const riskArea = await ComplianceRiskArea.create(req.body);

      const fullRiskArea = await ComplianceRiskArea.findByPk(riskArea.id, {
        include: [
          {
            model: RegulationGroup,
            as: 'regulationGroup'
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Compliance risk area created successfully',
        data: fullRiskArea
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Error creating compliance risk area',
        error: error.message
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const riskArea = await ComplianceRiskArea.findByPk(id);
      if (!riskArea) {
        return res.status(404).json({
          success: false,
          message: 'Compliance risk area not found'
        });
      }

      await riskArea.update(req.body);

      const updatedRiskArea = await ComplianceRiskArea.findByPk(id, {
        include: [
          {
            model: RegulationGroup,
            as: 'regulationGroup'
          }
        ]
      });

      res.json({
        success: true,
        message: 'Compliance risk area updated successfully',
        data: updatedRiskArea
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Error updating compliance risk area',
        error: error.message
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const riskArea = await ComplianceRiskArea.findByPk(id);
      if (!riskArea) {
        return res.status(404).json({
          success: false,
          message: 'Compliance risk area not found'
        });
      }

      await riskArea.destroy();

      res.json({
        success: true,
        message: 'Compliance risk area deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error deleting compliance risk area',
        error: error.message
      });
    }
  }
}

export default new ComplianceRiskAreaController();
