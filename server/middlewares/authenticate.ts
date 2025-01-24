import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';



const secretKey = process.env.JWT_SECRET;

export default function authenticate(req, res, next) {
  try {
    // Add debug logging
    // console.log('Cookies received:', req.cookies);
    // console.log('Raw Cookie header:', req.headers.cookie);

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Failed to authenticate token' });
      }
      req.userId = decoded.userId;
      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}