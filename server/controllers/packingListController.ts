import { Request, Response } from 'express';
import { User } from '../models/userModel';
import { PackingListModel } from '../models/packingListModel';

const packingListController = {
  savePackingList: async (req: Request, res: Response): Promise<Response> => {
    const { userId, location, duration, items, specialConsiderations } =
      req.body;

    // Validate required fields
    if (!location || !duration || !items || !Array.isArray(items)) {
      return res.status(400).json({
        error:
          'Missing or invalid required fields. Need location, duration, and items array',
      });
    }

    // Validate location fields
    if (
      !location.country ||
      !location.city ||
      !Array.isArray(location.weatherConditions)
    ) {
      return res.status(400).json({
        error: 'Location must include country, city, and weather conditions',
      });
    }

    // Validate duration fields
    if (!duration.startDate || !duration.endDate || !duration.totalDays) {
      return res.status(400).json({
        error: 'Duration must include startDate, endDate, and totalDays',
      });
    }

    try {
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create new packing list
      const packingList = new PackingListModel({
        userId: user._id,
        location: {
          country: location.country,
          city: location.city,
          weatherConditions: location.weatherConditions,
          localRestrictions: location.localRestrictions || [],
          recommendedItems: location.recommendedItems || [],
        },
        duration: {
          startDate: new Date(duration.startDate),
          endDate: new Date(duration.endDate),
          totalDays: duration.totalDays,
        },
        items: items.map((item) => ({
          item: item.name,
          quantity: item.quantity,
          category: item.category,
          isEssential: item.isEssential,
          notes: item.notes,
        })),
        specialConsiderations: specialConsiderations || [],
        lastUpdated: new Date(),
      });

      // Save packing list
      await packingList.save();

      // Add to user's saved packing lists
      user.savedPackingList.push(packingList.id);
      await user.save();

      return res.status(201).json({
        message: 'Packing list saved successfully',
        packingList: packingList,
      });
    } catch (error) {
      console.error('Error saving packing list:', error);

      // More specific error handling
      if (error instanceof Error) {
        if (error.name === 'ValidationError') {
          return res.status(400).json({
            error: 'Validation error',
            details: error.message,
          });
        }
      }

      return res.status(500).json({
        error: 'Failed to save packing list',
      });
    }
  },

  getPackingList: async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.body;

    try {
      const user = await User.findById(userId).populate('savedPackingList');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({
        message: 'Here is your packing list.',
        packingList: user.savedPackingList,
      });
    } catch (error) {
      console.error('Error getting packing list:', error);
      return res.status(404).json({ error: 'Failed to retrieve packing list' });
    }
  },
};

export default packingListController;
