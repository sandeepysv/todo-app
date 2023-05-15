import IUser from 'interfaces/user.interface';
import mongoose, { Schema } from 'mongoose';

const userSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;