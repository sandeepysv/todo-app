import IPost from 'interfaces/post.interface';
import mongoose, { Schema } from 'mongoose';

const PostSchema: Schema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  comments: [
    {
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        required: true
      }
    }
  ],
}, {
  timestamps: true
});

export default mongoose.model<IPost>('Post', PostSchema);