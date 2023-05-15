import { Request, Response } from 'express';
import IUser from 'interfaces/user.interface';
import Todo from '../models/todo.model';
import ITodo from 'interfaces/todo.interface';

interface AuthenticatedRequest extends Request {
    token?: string;
    user?: IUser;
}

// Get all todos for a user
export const getTodosForUser = async (req: Request, res: Response) => {
    try {
        // Default limit is 10, default page is 1
        const { userId, limit = 10, page = 1, search = '' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let queryOptions = {};
        if(userId) queryOptions = { userId };
        if(search.length)
            queryOptions = {
                ...queryOptions,
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ]
            };
        const todos: ITodo[] = await Todo.find(queryOptions).skip(offset).limit(Number(limit));
        return res.status(200).json({ page: Number(page), count: Number(limit), todos });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

// Create a new todo
export const createTodo = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;
        const newTodo: ITodo = new Todo({
            title,
            description,
            completed: false,
            userId,
        });
        const savedTodo: ITodo = await newTodo.save();
        return res.status(201).json(savedTodo);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

// Update an existing todo
export const updateTodo = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;
        const { title, description, completed } = req.body;
        const todoObj: ITodo | null = await Todo.findById(id);
        let queryOptions = {};
        if(role == 'admin') {
            queryOptions = {
                _id: id
            };
        }
        else {
            queryOptions = {
                _id: id,
                userId
            };
        }
        const updatedTodo: ITodo | null = await Todo.findOneAndUpdate(
            queryOptions,
            { title, description, completed },
            { new: true }
        );
        if (!todoObj) {
            return res.status(404).send('Todo not found');
        }
        if (todoObj && !updatedTodo) {
            return res.status(401).send('Unauthorized!');
        }
        return res.status(200).json(updatedTodo);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

// Delete an existing todo
export const deleteTodo = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;
        const todoObj: ITodo | null = await Todo.findById(id);
        let queryOptions = {};
        if(role == 'admin') {
            queryOptions = {
                _id: id
            };
        }
        else {
            queryOptions = {
                _id: id,
                userId
            };
        }
        const deletedTodo: ITodo | null = await Todo.findOneAndDelete(queryOptions);
        if (!todoObj) {
            return res.status(404).send('Todo not found');
        }
        if (todoObj && !deletedTodo) {
            return res.status(401).send('Unauthorized!');
        }
        return res.status(200).json({ message: 'Todo deleted successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};