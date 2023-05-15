import { Document } from "mongoose";
import IComment from "./comment.interface";

export default interface IPost extends Document {
    author: string;
    text: string;
    comments: IComment[];
}