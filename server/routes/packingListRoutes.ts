import express, { Router } from 'express';
import packingListController from '../controllers/packingListController';

const router: Router = express.Router();

router.post('/savePackingList', async (req, res, next) => {
  try {
    await packingListController.savePackingList(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/getPackingList', async (req, res, next) => {
  try {
    await packingListController.getPackingList(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
