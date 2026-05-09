import path from 'path';

export function resolveTargetDir(projectName) {
    if (projectName === '.') return process.cwd();
    return path.resolve(process.cwd(), projectName);
}

export function getExt(language) {
    return language === 'ts' ? 'ts' : 'js';
}

export function isTypeScript(language) {
    return language === 'ts';
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function buildPackageJson(options) {
    const { projectName, language, database, middlewaresList, storage, emailService, port } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const pkg = {
        name: projectName === '.' ? path.basename(process.cwd()) : projectName,
        version: '1.0.0',
        main: `src/index.${ext}`,
        type: 'module',
        scripts: {},
        dependencies: {
            express: '^4.21.0'
        },
        devDependencies: {}
    };

    if (isTS) {
        pkg.scripts = {
            start: 'node dist/index.js',
            dev: 'tsx watch src/index.ts',
            build: 'tsc'
        };
        pkg.devDependencies = {
            typescript: '^5.5.0',
            '@types/node': '^20.14.0',
            '@types/express': '^4.17.21',
            tsx: '^4.16.0'
        };
        if (middlewaresList.includes('cors')) pkg.devDependencies['@types/cors'] = '^2.8.17';
        if (middlewaresList.includes('morgan')) pkg.devDependencies['@types/morgan'] = '^1.9.9';
        if (middlewaresList.includes('cookieParser')) pkg.devDependencies['@types/cookie-parser'] = '^1.4.7';
    } else {
        pkg.scripts = {
            start: `node src/index.${ext}`,
            dev: 'nodemon src/index.js'
        };
        pkg.devDependencies.nodemon = '^3.1.0';
    }

    if (middlewaresList.includes('cors')) pkg.dependencies.cors = '^2.8.5';
    if (middlewaresList.includes('helmet')) pkg.dependencies.helmet = '^8.0.0';
    if (middlewaresList.includes('morgan')) pkg.dependencies.morgan = '^1.10.0';
    if (middlewaresList.includes('rateLimit')) pkg.dependencies['express-rate-limit'] = '^7.2.0';
    if (middlewaresList.includes('cookieParser')) pkg.dependencies['cookie-parser'] = '^1.4.6';
    if (middlewaresList.includes('dotenv')) pkg.dependencies.dotenv = '^16.4.0';
    if (middlewaresList.includes('zod')) pkg.dependencies.zod = '^3.24.0';
    if (middlewaresList.includes('joi')) pkg.dependencies.joi = '^17.13.0';
    if (middlewaresList.includes('cron')) pkg.dependencies['cron-guardian'] = '^1.0.0';

    if (database === 'mongodb') pkg.dependencies.mongoose = '^8.9.0';
    if (['postgresql', 'mysql', 'sqlite'].includes(database)) {
        pkg.dependencies.sequelize = '^6.37.0';
        if (database === 'postgresql') pkg.dependencies.pg = '^8.12.0';
        if (database === 'mysql') pkg.dependencies.mysql2 = '^3.9.0';
        if (database === 'sqlite') pkg.dependencies.sqlite3 = '^5.1.7';
    }

    if (storage === 'local') pkg.dependencies.multer = '^1.4.5-lts.1';
    if (storage === 's3') pkg.dependencies['@aws-sdk/client-s3'] = '^3.500.0';
    if (storage === 'cloudinary') pkg.dependencies.cloudinary = '^2.5.0';
    if (storage === 'firebase') pkg.dependencies['@firebase/storage'] = '^0.12.0';
    if (storage === 'uploadcare') pkg.dependencies['@uploadcare/upload-client'] = '^6.0.0';
    if (storage === 'mux') pkg.dependencies['@mux/mux-node'] = '^8.0.0';

    if (emailService === 'nodemailer') pkg.dependencies.nodemailer = '^6.9.14';
    if (emailService === 'sendgrid') pkg.dependencies['@sendgrid/mail'] = '^8.1.0';
    if (emailService === 'mailgun') pkg.dependencies['mailgun.js'] = '^4.0.0';
    if (emailService === 'brevo') pkg.dependencies['@getbrevo/brevo'] = '^2.0.0';
    if (emailService === 'mailcheap') pkg.dependencies.nodemailer = '^6.9.14';

    return pkg;
}

export function buildTsconfig() {
    return {
        compilerOptions: {
            target: 'ESNext',
            module: 'ESNext',
            moduleResolution: 'node',
            esModuleInterop: true,
            forceConsistentCasingInFileNames: true,
            strict: true,
            skipLibCheck: true,
            outDir: './dist',
            rootDir: './src'
        },
        include: ['src/**/*']
    };
}