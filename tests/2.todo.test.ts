import request from 'supertest';
import { app, server } from '../src/app';
import mongoose from 'mongoose';
import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';
import Todo from '../src/models/todo.model';

describe('Todo APIs', () => {
    let authToken = '';
    let todoId = '';

    // Login before running tests
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                username: 'admin',
                password: 'password'
            });
        authToken = res.body.token;
        await Todo.deleteMany({});
    });

    // Test for creating a new todo
    it('should create a new todo', async () => {
        const res = await request(app)
            .post('/api/todo')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Buy groceries',
                description: 'Vegetables, Fruits, Eggs'
            });
        todoId = res.body._id;
        expect(res.status).toEqual(201);
        expect(res.body.title).toEqual('Buy groceries');
        expect(res.body.description).toEqual('Vegetables, Fruits, Eggs');
    });

    // Test for retrieving all todos for a user
    it('should retrieve all todos for a user', async () => {
        const res = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    // Test for updating a todo
    it('should update a todo', async () => {
        const res = await request(app)
            .put(`/api/todo/${todoId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Buy groceries and milk',
                description: 'Vegetables, Fruits, Eggs, Milk',
                completed: true
            });
        expect(res.status).toEqual(200);
        expect(res.body.title).toEqual('Buy groceries and milk');
        expect(res.body.description).toEqual('Vegetables, Fruits, Eggs, Milk');
        expect(res.body.completed).toEqual(true);
    });

    // Test for deleting a todo
    it('should delete a todo', async () => {
        const res = await request(app)
            .delete(`/api/todo/${todoId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toEqual(200);
    });

    // After all tests, close the Mongoose and Express servers
    afterAll(async () => {
        await mongoose.connection.close();
        await server.close();
    });
});