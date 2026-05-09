export function generateIndexFile(options) {
    const { language, database, middlewaresList, storage, emailService, port } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';
    const typeAnnotation = isTS ? ': any' : '';

    let imports = `import express from 'express';
${middlewaresList.includes('dotenv') ? "import 'dotenv/config';" : ""}
${middlewaresList.includes('cors') ? "import cors from 'cors';" : ""}
${middlewaresList.includes('helmet') ? "import helmet from 'helmet';" : ""}
${middlewaresList.includes('morgan') ? "import morgan from 'morgan';" : ""}
${middlewaresList.includes('cookieParser') ? "import cookieParser from 'cookie-parser';" : ""}
import { errorHandler } from './middlewares/errorHandler.js';
import connectDB from './config/db.js';
import userRoutes from './routes/user.routes.js';
import { logger } from './middlewares/logger.js';
${middlewaresList.includes('cron') ? "import './jobs/index.js';" : ""}`;

    let middlewareSetup = `${middlewaresList.includes('helmet') ? "app.use(helmet());" : ""}
${middlewaresList.includes('cors') ? "app.use(cors());" : ""}
${middlewaresList.includes('morgan') ? "app.use(morgan('dev'));" : ""}
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
${middlewaresList.includes('cookieParser') ? "app.use(cookieParser());" : ""}`;

    let storageImport = '';
    if (storage === 'local') {
        storageImport = "\nimport { upload } from './services/upload.service.js';";
    }

    let mainRoute = `app.get('/', (req${typeAnnotation}, res${typeAnnotation}) => {
    res.json({ message: 'API is running' });
});

app.use('/api/users', userRoutes);`;

    let content = `${imports}${storageImport}

const app = express();

connectDB();

${middlewareSetup}

${mainRoute}

app.use(errorHandler);

const PORT = process.env.PORT || ${port};
app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
`;

    return { path: `src/index.${ext}`, content };
}