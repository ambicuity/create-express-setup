export function generateErrorHandler(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `export const errorHandler = (err${isTS ? ': any' : ''}, req${isTS ? ': any' : ''}, res${isTS ? ': any' : ''}, next${isTS ? ': any' : ''}) => {
    const status = err.status || 500;
    res.status(status).json({
        error: {
            message: err.message || 'Internal Server Error',
            status
        }
    });
};`;

    return { path: `src/middlewares/errorHandler.${ext}`, content };
}

export function generateLogger(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `export const logger = (req${isTS ? ': any' : ''}, res${isTS ? ': any' : ''}, next${isTS ? ': any' : ''}) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const timestamp = new Date().toISOString();
        const method = req.method;
        const url = req.url;
        const status = res.statusCode;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        console.log(\`[\${timestamp}] \${method} \${url} \${status} - \${duration}ms | IP: \${ip} | UA: \${userAgent}\`);
    });
    next();
};`;

    return { path: `src/middlewares/logger.${ext}`, content };
}

export function generateRateLimitMiddleware(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: {
            message: 'Too many requests from this IP, please try again after 15 minutes',
            status: 429
        }
    }
});`;

    return { path: `src/middlewares/rateLimit.${ext}`, content };
}