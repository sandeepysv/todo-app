import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import IUser from '../interfaces/user.interface';
import getConfig from '../../config';
const env = process.env.NODE_ENV || 'development';
const config = getConfig(env);

interface AuthenticatedRequest extends Request {
  token?: string;
  user?: IUser;
}

const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    const user = await User.findOne({ _id: decoded.userId, 'tokens.token': token });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    if(error.name == 'TokenExpiredError') {
      res.status(401).send({ error: 'Token Expired!' });
    }
    else res.status(401).send({ error: 'Authentication Failed!' });
  }
};

export default auth;