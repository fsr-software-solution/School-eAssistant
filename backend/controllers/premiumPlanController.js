import PremiumPlan from '../models/PremiumPlan.js';
import { z } from 'zod';

const planSchema = z.object({
  planName: z.string().min(2, 'Plan name must be at least 2 characters'),
  description: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day'),
  features: z.array(z.string()).min(1, 'At least one feature required')
});

class PremiumPlanController {
  static async createPlan(req, res, next) {
    try {
      const validation = planSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan data',
          errors: validation.error.errors
        });
      }

      const { planName, description, amount, durationDays, features } = validation.data;

      const existingPlan = await PremiumPlan.findOne({ planName });
      if (existingPlan) {
        return res.status(409).json({
          success: false,
          message: 'A plan with this name already exists'
        });
      }

      const plan = new PremiumPlan({
        planName,
        description,
        amount,
        durationDays,
        features
      });
      await plan.save();

      res.status(201).json({
        success: true,
        message: 'Premium plan created successfully',
        data: plan
      });
    } catch (error) {
      console.error('Create plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create premium plan',
        error: error.message
      });
    }
  }

  static async getAllPlans(req, res, next) {
    try {
      const { includeDeleted = false } = req.query;
      const filter = includeDeleted === 'true' ? {} : { isDeleted: false };

      const plans = await PremiumPlan.find(filter).sort({ updatedAt: -1 });

      res.status(200).json({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Get all plans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve plans',
        error: error.message
      });
    }
  }

  static async getActivePlans(req, res, next) {
    try {
      const plans = await PremiumPlan.getActivePlans();
      res.status(200).json({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Get active plans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve active plans',
        error: error.message
      });
    }
  }

  static async getPlanById(req, res, next) {
    try {
      const { planId } = req.params;
      const plan = await PremiumPlan.findById(planId);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Premium plan not found'
        });
      }

      res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error) {
      console.error('Get plan by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve plan',
        error: error.message
      });
    }
  }

  static async updatePlan(req, res, next) {
    try {
      const { planId } = req.params;
      const validation = planSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan data',
          errors: validation.error.errors
        });
      }

      const { planName, description, amount, durationDays, features } = validation.data;
      const plan = await PremiumPlan.findById(planId);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Premium plan not found'
        });
      }

      if (planName !== plan.planName) {
        const existing = await PremiumPlan.findOne({ planName });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'A plan with this name already exists'
          });
        }
      }

      plan.planName = planName;
      plan.description = description;
      plan.amount = amount;
      plan.durationDays = durationDays;
      plan.features = features;
      await plan.save();

      res.status(200).json({
        success: true,
        message: 'Premium plan updated successfully',
        data: plan
      });
    } catch (error) {
      console.error('Update plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update plan',
        error: error.message
      });
    }
  }

  static async deletePlan(req, res, next) {
    try {
      const { planId } = req.params;
      const plan = await PremiumPlan.findById(planId);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Premium plan not found'
        });
      }

      await plan.softDelete();

      res.status(200).json({
        success: true,
        message: 'Premium plan deleted successfully'
      });
    } catch (error) {
      console.error('Delete plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete plan',
        error: error.message
      });
    }
  }

  static async restorePlan(req, res, next) {
    try {
      const { planId } = req.params;
      const plan = await PremiumPlan.findById(planId);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Premium plan not found'
        });
      }

      if (!plan.isDeleted) {
        return res.status(400).json({
          success: false,
          message: 'Plan is not deleted'
        });
      }

      await plan.restore();

      res.status(200).json({
        success: true,
        message: 'Premium plan restored successfully',
        data: plan
      });
    } catch (error) {
      console.error('Restore plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restore plan',
        error: error.message
      });
    }
  }
}

export default PremiumPlanController;

