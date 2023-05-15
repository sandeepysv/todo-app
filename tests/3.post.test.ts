import request from 'supertest';
import { app, server } from '../src/app';
import mongoose from 'mongoose';
import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';
import Post from '../src/models/post.model';

describe('Post APIs', () => {
    let authToken: string;
    let postId: string;

    // Login before running tests
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                username: 'admin',
                password: 'password'
            });
        authToken = res.body.token;

        await Post.deleteMany({});
    });


    describe('GET /posts', () => {
        it('should return all posts', async () => {
            const response = await request(app)
                .get('/api/posts')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
        });

        it('should return unauthorized without a valid token', async () => {
            const response = await request(app).get('/api/posts');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /post', () => {
        it('should create a new post', async () => {
            const post = {
                text: 'Test Post'
            };

            const response = await request(app)
                .post('/api/post')
                .set('Authorization', `Bearer ${authToken}`)
                .send(post);

            expect(response.status).toBe(201);
            expect(response.body.author).toBeDefined();
            expect(response.body.text).toEqual(post.text);
            expect(response.body.comments).toHaveLength(0);

            postId = response.body._id;
        });

        it('should return unauthorized without a valid token', async () => {
            const response = await request(app).post('/api/post');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /post/:id', () => {
        it('should return the post with the specified id', async () => {
            const response = await request(app)
                .get(`/api/post/${postId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body._id).toEqual(postId);
        });

        it('should return not found for an invalid id', async () => {
            const response = await request(app)
                .get('/api/post/123')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it('should return unauthorized without a valid token', async () => {
            const response = await request(app).get(`/api/post/${postId}`);

            expect(response.status).toBe(401);
        });
    });

    describe('POST /post/:id/comments', () => {
        it('should add a comment to the post with the specified id', async () => {
          const comment = {
            text: 'This is a test comment',
          };
    
          const response = await request(app)
            .post(`/api/post/${postId}/comments`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(comment);
    
          expect(response.status).toBe(201);
          expect(response.body.comments).toHaveLength(1);
          expect(response.body.comments[0].text).toEqual(comment.text);
        });
    });

    // After all tests, close the Mongoose and Express servers
    afterAll(async () => {
        await mongoose.connection.close();
        await server.close();
    });
});