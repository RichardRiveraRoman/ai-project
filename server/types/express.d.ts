import { User } from '../models/userModel.ts';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: mongoose.Types.ObjectId;
      };
    }
  }
}
