import { spinner } from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import { buildPackageJson, buildTsconfig, getExt, isTypeScript } from './utils.js';
import { generateIndexFile } from './templates/index.js';
import { generateDbConfig } from './templates/config.js';
import { generateErrorHandler, generateLogger, generateRateLimitMiddleware } from './templates/middlewares.js';
import { generateMongoUserModel, generateSequelizeUserModel } from './templates/models.js';
import { generateUserController } from './templates/controllers.js';
import { generateUserRoutes } from './templates/routes.js';
import { generateUserZodValidator, generateUserJoiValidator } from './templates/validators.js';
import { generateUploadService, generateS3Service, generateCloudinaryService, generateFirebaseService, generateUploadcareService, generateMuxService, generateNodemailerService, generateSendgridService, generateMailgunService, generateBrevoService, generateMailcheapService } from './templates/services.js';
import { generateCronJob } from './templates/jobs.js';
import { generateEnvContent, generateGitignore } from './templates/env.js';

export async function scaffoldProject(options) {
    const s = spinner();
    s.start('Scaffolding project structure...');

    const { targetDir, language, database, middlewaresList, storage, emailService, port, projectName } = options;
    const isTS = isTypeScript(language);
    const ext = getExt(language);

    if (projectName !== '.') {
        await fs.ensureDir(targetDir);
    }

    const folders = [
        'src/config',
        'src/controllers',
        'src/routes',
        'src/middlewares',
        'src/models',
        'src/services',
        'src/utils',
        'src/templates',
    ];

    if (storage === 'local') folders.push('uploads');
    if (middlewaresList.includes('zod') || middlewaresList.includes('joi')) folders.push('src/validators');
    if (middlewaresList.includes('cron')) folders.push('src/jobs');

    for (const folder of folders) {
        await fs.ensureDir(path.join(targetDir, folder));
    }

    s.message('Generating package.json...');
    const pkg = buildPackageJson(options);
    await fs.writeJSON(path.join(targetDir, 'package.json'), pkg, { spaces: 2 });

    if (isTS) {
        s.message('Generating tsconfig.json...');
        const tsconfig = buildTsconfig();
        await fs.writeJSON(path.join(targetDir, 'tsconfig.json'), tsconfig, { spaces: 2 });
    }

    s.message('Generating src/index...');
    const indexFile = generateIndexFile(options);
    await fs.writeFile(path.join(targetDir, indexFile.path), indexFile.content);

    s.message('Generating config/db...');
    const dbConfig = generateDbConfig(options);
    await fs.writeFile(path.join(targetDir, dbConfig.path), dbConfig.content);

    s.message('Generating middlewares/logger...');
    const loggerFile = generateLogger(options);
    await fs.writeFile(path.join(targetDir, loggerFile.path), loggerFile.content);

    s.message('Generating middlewares/errorHandler...');
    const errorFile = generateErrorHandler(options);
    await fs.writeFile(path.join(targetDir, errorFile.path), errorFile.content);

    if (middlewaresList.includes('rateLimit')) {
        s.message('Generating middlewares/rateLimit...');
        const rateLimitFile = generateRateLimitMiddleware(options);
        await fs.writeFile(path.join(targetDir, rateLimitFile.path), rateLimitFile.content);
    }

    if (database === 'mongodb') {
        s.message('Generating models/mongoUser...');
        const mongoModel = generateMongoUserModel(options);
        await fs.writeFile(path.join(targetDir, mongoModel.path), mongoModel.content);
    } else if (['postgresql', 'mysql', 'sqlite'].includes(database)) {
        s.message('Generating models/User...');
        const sequelizeModel = generateSequelizeUserModel(options);
        await fs.writeFile(path.join(targetDir, sequelizeModel.path), sequelizeModel.content);
    }

    s.message('Generating User CRUD controllers...');
    const controller = generateUserController(options);
    await fs.writeFile(path.join(targetDir, controller.path), controller.content);

    s.message('Generating User routes...');
    const routes = generateUserRoutes(options);
    await fs.writeFile(path.join(targetDir, routes.path), routes.content);

    if (middlewaresList.includes('zod')) {
        s.message('Generating Zod validators...');
        const validator = generateUserZodValidator(options);
        await fs.writeFile(path.join(targetDir, validator.path), validator.content);
    } else if (middlewaresList.includes('joi')) {
        s.message('Generating Joi validators...');
        const validator = generateUserJoiValidator(options);
        await fs.writeFile(path.join(targetDir, validator.path), validator.content);
    }

    if (middlewaresList.includes('cron')) {
        s.message('Generating src/jobs...');
        const cronFile = generateCronJob(options);
        await fs.writeFile(path.join(targetDir, cronFile.path), cronFile.content);
    }

    if (storage === 'local') {
        s.message('Generating upload service...');
        const uploadFile = generateUploadService(options);
        await fs.writeFile(path.join(targetDir, uploadFile.path), uploadFile.content);
    }
    if (storage === 's3') {
        s.message('Generating S3 service...');
        const s3File = generateS3Service(options);
        await fs.writeFile(path.join(targetDir, s3File.path), s3File.content);
    }
    if (storage === 'cloudinary') {
        s.message('Generating Cloudinary service...');
        const cloudinaryFile = generateCloudinaryService(options);
        await fs.writeFile(path.join(targetDir, cloudinaryFile.path), cloudinaryFile.content);
    }
    if (storage === 'firebase') {
        s.message('Generating Firebase service...');
        const firebaseFile = generateFirebaseService(options);
        await fs.writeFile(path.join(targetDir, firebaseFile.path), firebaseFile.content);
    }
    if (storage === 'uploadcare') {
        s.message('Generating Uploadcare service...');
        const uploadcareFile = generateUploadcareService(options);
        await fs.writeFile(path.join(targetDir, uploadcareFile.path), uploadcareFile.content);
    }
    if (storage === 'mux') {
        s.message('Generating Mux service...');
        const muxFile = generateMuxService(options);
        await fs.writeFile(path.join(targetDir, muxFile.path), muxFile.content);
    }

    if (emailService === 'nodemailer') {
        s.message('Generating Nodemailer service...');
        const emailFile = generateNodemailerService(options);
        await fs.writeFile(path.join(targetDir, emailFile.path), emailFile.content);
    }
    if (emailService === 'sendgrid') {
        s.message('Generating SendGrid service...');
        const emailFile = generateSendgridService(options);
        await fs.writeFile(path.join(targetDir, emailFile.path), emailFile.content);
    }
    if (emailService === 'mailgun') {
        s.message('Generating Mailgun service...');
        const emailFile = generateMailgunService(options);
        await fs.writeFile(path.join(targetDir, emailFile.path), emailFile.content);
    }
    if (emailService === 'brevo') {
        s.message('Generating Brevo service...');
        const emailFile = generateBrevoService(options);
        await fs.writeFile(path.join(targetDir, emailFile.path), emailFile.content);
    }
    if (emailService === 'mailcheap') {
        s.message('Generating Mailcheap service...');
        const emailFile = generateMailcheapService(options);
        await fs.writeFile(path.join(targetDir, emailFile.path), emailFile.content);
    }

    s.message('Generating .env...');
    const envContent = generateEnvContent(options);
    await fs.writeFile(path.join(targetDir, '.env'), envContent);
    await fs.writeFile(path.join(targetDir, '.env.example'), envContent);
    await fs.writeFile(path.join(targetDir, '.gitignore'), generateGitignore());

    s.stop('Files generated.');

    s.start('Installing dependencies...');
    try {
        await execa('npm', ['install'], { cwd: targetDir });
        s.stop('Dependencies installed.');
    } catch (error) {
        s.stop('Failed to install dependencies.');
    }

    s.start('Initializing Git...');
    try {
        await execa('git', ['init'], { cwd: targetDir });
        s.stop('Git initialized.');
    } catch (error) {
        s.stop('Failed to initialize Git.');
    }
}