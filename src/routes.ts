import { Router } from 'express';
import { createUser, loginUser, getUser } from './controllers/user.controller';
import { getTodosForUser, createTodo, updateTodo, deleteTodo } from './controllers/todo.controller';
import { createPost, getAllPosts, getPostById, addCommentToPost, updatePost, deletePost } from './controllers/post.controller';
import auth from './middleware/auth.middleware';
import rateLimit from 'express-rate-limit';
import cacher from './middleware/cacher.middleware';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const routes = Router();

// User routes
routes.post('/user', limiter, createUser);
routes.post('/login', limiter, loginUser);
routes.get('/user', limiter, cacher, auth, getUser);

// Todo Routes
routes.get('/todos', limiter, cacher, auth, getTodosForUser);
routes.post('/todo', limiter, auth, createTodo);
routes.put('/todo/:id', limiter, auth, updateTodo);
routes.delete('/todo/:id', limiter, auth, deleteTodo);

// Post Routes
routes.get('/posts', limiter, cacher, auth, getAllPosts);
routes.get('/post/:id', limiter, cacher, auth, getPostById);
routes.post('/post', limiter, auth, createPost);
routes.put('/post/:id', limiter, auth, updatePost);
routes.post('/post/:id/comments', limiter, auth, addCommentToPost);
routes.delete('/post/:id', limiter, auth, deletePost);

export default routes;