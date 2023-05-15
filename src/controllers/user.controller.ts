import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import IUser from '../interfaces/user.interface';
import getConfig from '../../config';
const env = process.env.NODE_ENV || 'development';
const config = getConfig(env);

interface AuthenticatedRequest extends Request {
  token?: string;
  user?: IUser;
}

// Create a new User
const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role = 'user' } = req.body;

    // Check if user with same username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hashedPassword, role });
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1h' });
    user.tokens.push({ token });
    await user.save();

    // Send response without password field
    const { password: excludedPassword, tokens: excludedTokens, ...userWithoutPassword } = user.toObject();
    return res.status(201).json({ ...userWithoutPassword, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// Login User and Generate a JWT Token
const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username }).select('+password');
    if (user == null) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1h' });
    user.tokens.push({ token });
    await user.save();

    // Send response without password field
    const { password: excludedPassword, tokens: excludedTokens, ...userWithoutPassword } = user.toObject();
    return res.status(200).json({ ...userWithoutPassword, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get logged in User Details
const getUser = async (req: AuthenticatedRequest, res: Response) => {
  // Return the Logged in User Object
  return res.status(200).json(req.user);
};

export { createUser, loginUser, getUser };