import { Request, Response } from 'express';
import Post from '../models/post.model';
import IUser from 'interfaces/user.interface';
import IPost from 'interfaces/post.interface';
import IComment from 'interfaces/comment.interface';

interface AuthenticatedRequest extends Request {
    token?: string;
    user?: IUser;
}

// Create a new post
export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text } = req.body;
    const author = req.user.id;
    const newPost: IPost = await Post.create({ author, text });
    return res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    return res.status(500).json('Internal Server Error');
  }
};

// Get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let queryOptions = {};
    if(search.length) queryOptions = { text: { $regex: search, $options: 'i' } };
    const posts: IPost[] = await Post.find(queryOptions).populate('author', 'username').skip(offset).limit(Number(limit));
    return res.status(200).json({ page: Number(page), count: Number(limit), posts});
  } catch (err) {
    console.error(err);
    return res.status(500).json('Internal Server Error');
  }
};

// Get a single post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post: IPost | null = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) {
        throw new Error();
    }
    return res.status(200).json(post);
  } catch (err) {
    return res.status(404).json('Post not found');
  }
};

// Add a comment to a post
export const addCommentToPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post: IPost | null = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json('Post not found');
    }
    const { text } = req.body;
    const author = req.user.id;
    const comment: IComment = { author, text };
    post.comments.push(comment);
    const updatedPost: IPost = await post.save();
    return res.status(201).json(updatedPost);
  } catch (err) {
    console.error(err);
    return res.status(500).json('Internal Server Error');
  }
};

// Update an existing post
export const updatePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;
        const { text } = req.body;
        const postObj: IPost | null = await Post.findById(id);
        let queryOptions = {};
        if(role == 'admin') {
            queryOptions = {
                _id: id
            };
        }
        else {
            queryOptions = {
                _id: id,
                author: userId
            };
        }
        const updatedPost: IPost | null = await Post.findOneAndUpdate(
            queryOptions,
            { text },
            { new: true }
        );
        if (!postObj) {
            return res.status(404).send('Post not found');
        }
        if (postObj && !updatedPost) {
            return res.status(401).send('Unauthorized!');
        }
        return res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

// Delete an existing post
export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;
      const postObj: IPost | null = await Post.findById(id);
      let queryOptions = {};
      if(role == 'admin') {
          queryOptions = {
              _id: id
          };
      }
      else {
          queryOptions = {
              _id: id,
              author: userId
          };
      }
      const deletedPost: IPost | null = await Post.findOneAndDelete(queryOptions);
      if (!postObj) {
          return res.status(404).send('Post not found');
      }
      if (postObj && !deletedPost) {
          return res.status(401).send('Unauthorized!');
      }
      return res.status(200).json({ message: 'Post deleted successfully!' });
  } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
  }
};