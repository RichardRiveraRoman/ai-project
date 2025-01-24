import { Request, Response } from express;
import { User } from '../models/userModel.ts';
import PackingList from '../models/packingListModel.ts'
import mongoose from 'mongoose';

interface PackingListController {
    savePackingList: (req: Request, res: Response) => Promise<Response>;
    getPackingList: (req: Request, res: Response) => Promise<Response>;
}
const packingListController: PackingListController = {
    savePackingList: async(req: Request, res: Response): Promise<Response> => {
        // get item & quantity from req body
        const {item, quantity}: {item: string; quantity: number} = req.body;
        const userId: mongoose.Types.ObjectId = req.user._id;
        if (!item || !quantity) {
            return res.status(400).jsoon({ error: 'Lacking either item name or quantity'});
        }
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found'});
            }
            const packingListItem = new PackingList({
                userId: user._id,
                item,
                quantity,    
            });
            await packingListItem.save();
            user.savedPackingList.push(packingListItem._id);
            await user.save();
            return res.status(201).json({
                message: 'Item saved to packling list successfully',
                packingList: packingListItem,
            });
        } catch(error) {
            console.error('Error saving packing list:', error);
            return res.status(500).json({error: 'Failed to save packing list'})
        }
    },
    getPackingList: async(req: Request, res: Response): Promise<Response> => {
        const userId: mongoose.Types.ObjectId = req.user._id;
        try {
            const user = await User.findById(userId).populate('savedPackingList')
            if (!user) {
                return res.status(404).json({ error: 'User not found'});
            }
            return res.status(200).json({
                message: 'Here is your packing list.',
                packingList: user.savedPackingList,
            });
        } catch(error) {
            console.error('Error getting packing list:', error);
            return res.status(404).json({ error: 'Failed to retrieve packing list'})
        } 
    },
};

export default packingListController;