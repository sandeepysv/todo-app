# Todo App

Scalable and Extensible Todo Backend App made using MongoDB, Typescript, NodeJS and ExpressJS.

## Prerequisites
* NodeJS
* MongoDB
* Redis Server
* Postman

## Code Setup
Run this command in your Project Folder
```bash
npm install
```

## Execution
For starting the Backend Server (Default Port is 8080)
```bash
npm start
```

For running the Test Cases
```bash
npm test
```
## Features
* User Authentication and Authorisation has been added using JWT Token
* All the List Pages for Todos and Posts having Pagination and Querying
* Few of the APIs have been added to Redis Cache
* Rate Limiting has been added for restricting each IP to 100 Requests per 15 Minutes Window
* RBAC has been Implemented for different Endpoints
* Test Cases have been added using Jest Module