import ITodo from 'interfaces/todo.interface';
import mongoose, { Schema } from 'mongoose';

const todoSchema: Schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Todo = mongoose.model<ITodo>('Todo', todoSchema);
export default Todo;