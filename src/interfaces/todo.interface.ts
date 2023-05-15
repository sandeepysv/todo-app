import { Document } from "mongoose";

export default interface ITodo extends Document {
    userId: string;
    title: string;
    description: string;
    completed: boolean;
}