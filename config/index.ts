interface Config {
    HOSTNAME: string;
    PORT: string;
    MONGO_URL: string;
    JWT_SECRET: string;
    REDIS: {
        HOST: string;
        PORT: number;
    }
}

const config: { [key: string]: Config } = {
    development: require('./development.json'),
    sandbox: require('./sandbox.json'),
    production: require('./production.json'),
};

export default function getConfig(env: string): Config {
    return config[env];
}