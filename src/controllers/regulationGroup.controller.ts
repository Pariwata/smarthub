import { Request, Response } from 'express';
import { RegulationGroup, ComplianceRiskArea } from '../models';

export class RegulationGroupController {
  async getAll(req: Request, res: Response) {
    try {
      const groups = await RegulationGroup.findAll({
        include: [
          {
            model: ComplianceRiskArea,
            as: 'riskAreas'
          }
        ],
        order: [['code', 'ASC']]
      });

      res.json({
        success: true,
        data: groups
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching regulation groups',
        error: error.message
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const group = await RegulationGroup.findByPk(id, {
        include: [
          {
            model: ComplianceRiskArea,
            as: 'riskAreas'
          }
        ]
      });

      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Regulation group not found'
        });
      }

      res.json({
        success: true,
        data: group
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching regulation group',
        error: error.message
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const group = await RegulationGroup.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Regulation group created successfully',
        data: group
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Error creating regulation group',
        error: error.message
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const group = await RegulationGroup.findByPk(id);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Regulation group not found'
        });
      }

      await group.update(req.body);

      res.json({
        success: true,
        message: 'Regulation group updated successfully',
        data: group
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Error updating regulation group',
        error: error.message
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const group = await RegulationGroup.findByPk(id);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Regulation group not found'
        });
      }

      await group.destroy();

      res.json({
        success: true,
        message: 'Regulation group deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error deleting regulation group',
        error: error.message
      });
    }
  }
}

export default new RegulationGroupController();
