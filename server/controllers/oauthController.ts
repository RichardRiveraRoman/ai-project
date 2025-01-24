import OauthUser from '../models/oauthUserModel';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

// OAuth Client Credentials
const CLIENT_ID = process.env.VITE_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export const getAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // User's one time use access token
    const { code } = req.query;
    // Build the query string for GitHub token exchange
    const params = `?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`;

    // Send GitHub our applications OAuth credentials
    const response = await fetch(
      'https://github.com/login/oauth/access_token' + params,
      {
        method: 'POST',
        headers: { Accept: 'application/json' },
      },
    );
    const data = await response.json();
    // Log the access token response to see what GitHub returned
    console.log('Access token response from GitHub:', data);
    // Send the same data back to the client as JSON
    res.json(data);
  } catch (err) {
    // Log any error that occurred during the fetch
    console.error('Error retrieving access token:', err);
    res.status(500).json({ error: 'Failed to fetch GitHub user data' });
  }
};

export const getUserData = async (req: Request, res: Response): Promise<Response> => {
  const authorizationHeader = req.get('Authorization');

  if (!authorizationHeader) {
    return res.status(400).json({ error: 'Authorization header is missing' });
  }

  try {

    // Ask GitHub for the user's account information
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      // Forward the Authorization header to GitHub
      headers: { Authorization: authorizationHeader },
    });
    const data = await response.json();
    // Log the user's GitHub profile information
    console.log('GitHub user data:', data);
    return res.json(data);
  } catch (err) {
    // Log any error that occurred while fetching user data
    console.error('Error retrieving user data:', err);
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

export const upsertUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { githubId, login, email, avatarUrl, name } = req.body;
    if (!githubId) {
      return res
        .status(400)
        .json({ error: 'Missing GitHub user ID in request body.' });
    }

    let user = await OauthUser.findOne({ githubId });
    if (!user) {
      user = new OauthUser({
        githubId,
        email,
        name: name || login,
        avatarUrl,
      });
      await user.save();
    }

    const secret = process.env.JWT_SECRET as string;

    if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
    }

    const token = jwt.sign({ userId: user._id }, secret, {
      expiresIn: '1h',
    });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, // 1 hour in milliseconds
    });

    return res.json({
      success: true,
      user: {
        _id: user._id,
        githubId: user.githubId,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (err) {
    console.error('Error in /github upsert route:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
