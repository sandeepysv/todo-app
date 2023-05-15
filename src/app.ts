// Express App
import express from 'express';

// Http Server
import http from 'http';

// Body Parser to format the Payload in JSON
import bodyParser from 'body-parser';

// Cookie Parser 
import cookieParser from 'cookie-parser';

// Response Compression
import compression from 'compression';

// Cross-Origin Resource Sharing
import cors from 'cors';

// Morgan logger middleware
import morgan from 'morgan';

// MongoDB Object Data Manager (ODM)
import mongoose from 'mongoose';

// Routes
import routes from './routes';

// Get App Config based on Environment
import getConfig from '../config';
const env = process.env.NODE_ENV || 'development';
const config = getConfig(env);
const HOSTNAME = config.HOSTNAME;
const PORT = config.PORT;
const MONGO_URL = config.MONGO_URL;

// Init App
export const app = express();

// App Settings
const corsOptions = {
    credentials: true,
};
app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.use('/api', routes);

// Create HTTP Server
export const server = http.createServer(app);

// Start listening for incoming requests
server.listen(PORT, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.once('open', function() {
    console.log('Connected to MongoDB!');
});
mongoose.connection.on('error', (error: Error) => console.error(error));