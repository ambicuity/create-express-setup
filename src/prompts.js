import { intro, outro, text, select, multiselect, confirm, note, cancel } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

export async function runInteractive(projectNameOverride) {
    intro(chalk.bgBlue.white(' 🚀 Backend Scaffolder CLI '));
    console.log(chalk.cyan('═'.repeat(60)));
    console.log(chalk.gray('💡 Press Ctrl+C anytime to exit'));
    console.log(chalk.cyan('═'.repeat(60)));

    let projectName = projectNameOverride;

    if (!projectName) {
        const projectLocation = await select({
            message: chalk.blue.bold('📁 Where should we create the project?'),
            options: [
                { value: 'current', label: chalk.green('📂 Current Directory') },
                { value: 'new', label: chalk.blue('📁 New Directory') },
            ],
        });

        if (projectLocation === 'new') {
            projectName = await text({
                message: 'Enter the directory name:',
                placeholder: 'my-backend',
                validate: (value) => {
                    if (!value) return 'Please enter a name';
                    if (fs.existsSync(value)) return 'Directory already exists';
                },
            });
        } else {
            projectName = '.';
        }
    }

    const language = await select({
        message: chalk.blue.bold('🔧 Choose your language:'),
        options: [
            { value: 'ts', label: chalk.green('● TypeScript') },
            { value: 'js', label: chalk.yellow('● JavaScript') },
        ],
    });

    const database = await select({
        message: chalk.blue.bold('🗄️  Choose your Database:'),
        options: [
            { value: 'mongodb', label: chalk.green('🍃 MongoDB (Mongoose)') },
            { value: 'postgresql', label: chalk.blue('🐘 PostgreSQL') },
            { value: 'mysql', label: chalk.yellow('🐬 MySQL') },
            { value: 'sqlite', label: chalk.cyan('📦 SQLite') },
            { value: 'none', label: chalk.gray('❌ None') },
        ],
    });

    console.log(chalk.cyan('─'.repeat(60)));

    const middlewaresList = await multiselect({
        message: chalk.blue.bold('⚙️  Select the tools you want to include:'),
        options: [
            { value: 'cors', label: chalk.green('● CORS') + chalk.gray(' (Cross-Origin Resource Sharing)'), hint: 'Recommended' },
            { value: 'helmet', label: chalk.green('● Helmet') + chalk.gray(' (Security Headers)'), hint: 'Recommended' },
            { value: 'morgan', label: chalk.yellow('○ Morgan') + chalk.gray(' (HTTP Request Logger)'), hint: 'Optional' },
            { value: 'rateLimit', label: chalk.yellow('○ Rate Limit') + chalk.gray(' (API Rate Limiting)'), hint: 'Optional' },
            { value: 'cookieParser', label: chalk.yellow('○ Cookie Parser') + chalk.gray(' (Cookie Handling)'), hint: 'Optional' },
            { value: 'dotenv', label: chalk.green('● Dotenv') + chalk.gray(' (Environment Variables)'), hint: 'Recommended' },
            { value: 'nodemon', label: chalk.yellow('○ Nodemon') + chalk.gray(' (Auto-restart Dev)'), hint: 'Optional' },
            { value: 'zod', label: chalk.yellow('○ Zod') + chalk.gray(' (Schema Validation)'), hint: 'Optional' },
            { value: 'joi', label: chalk.yellow('○ Joi') + chalk.gray(' (Schema Validation)'), hint: 'Optional' },
            { value: 'cron', label: chalk.yellow('○ Cron Jobs') + chalk.gray(' (cron-guardian)'), hint: 'Advanced' },
        ],
        required: false,
        initialValues: ['cors', 'helmet', 'dotenv'],
    });

    console.log(chalk.cyan('─'.repeat(60)));

    const storage = await select({
        message: chalk.blue.bold('📁 Where will you store media/files?'),
        options: [
            { value: 'local', label: chalk.green('💾 Local (Multer)') },
            { value: 's3', label: chalk.blue('☁️  AWS S3') },
            { value: 'cloudinary', label: chalk.cyan('🌤️  Cloudinary') },
            { value: 'firebase', label: chalk.yellow('🔥 Firebase Storage') },
            { value: 'uploadcare', label: chalk.blue('⬆️  Uploadcare') },
            { value: 'mux', label: chalk.red('🎥 Mux (Video)') },
            { value: 'none', label: chalk.gray('❌ None') },
        ],
    });

    console.log(chalk.cyan('─'.repeat(60)));

    const emailService = await select({
        message: chalk.blue.bold('📧 Choose your Email Service:'),
        options: [
            { value: 'none', label: chalk.gray('❌ None') },
            { value: 'nodemailer', label: chalk.green('📮 Nodemailer (SMTP)') },
            { value: 'sendgrid', label: chalk.blue('📬 SendGrid') },
            { value: 'mailgun', label: chalk.yellow('🔫 Mailgun') },
            { value: 'brevo', label: chalk.cyan('📨 Brevo (formerly Sendinblue)') },
            { value: 'mailcheap', label: chalk.yellow('💰 Mailcheap') },
        ],
    });

    console.log(chalk.cyan('─'.repeat(60)));

    const port = await text({
        message: chalk.blue.bold('🌐 Select Port (default: 8080):'),
        placeholder: '8080',
        validate: (value) => {
            if (value && isNaN(Number(value))) return chalk.red('⚠️  Please enter a valid number');
        }
    });

    const finalPort = port || '8080';

    console.log(chalk.cyan('─'.repeat(60)));

    let summary =
        `${chalk.blue('📋 Project Summary')}\n${chalk.cyan('═'.repeat(40))}\n` +
        `📁 Directory:     ${chalk.white(projectName)}\n` +
        `🔧 Language:      ${chalk.white(language)}\n` +
        `🗄️  Database:      ${chalk.white(database !== 'none' ? database : 'none')}\n` +
        `⚙️  Middlewares:   ${chalk.white(middlewaresList.join(', ') || 'none')}\n` +
        `📁 Storage:       ${chalk.white(storage !== 'none' ? storage : 'none')}\n` +
        `📧 Email Service: ${chalk.white(emailService !== 'none' ? emailService : 'none')}\n` +
        `🌐 Port:          ${chalk.white(finalPort)}`;

    note(summary, chalk.blue.bold('📋 Summary of your selections'));

    const proceed = await confirm({
        message: chalk.blue.bold('✅ Does this look correct? Proceed with installation?'),
    });

    if (!proceed || typeof proceed !== 'boolean') {
        const exitConfirm = await confirm({
            message: chalk.yellow('⚠️  Are you sure you want to exit?'),
        });
        if (exitConfirm) {
            outro(chalk.yellow('👋 Setup cancelled by user.'));
            process.exit(0);
        } else {
            return runInteractive(projectName);
        }
    }

    return {
        projectName,
        language,
        database,
        middlewaresList,
        storage,
        emailService,
        port: finalPort,
        targetDir: projectName === '.' ? process.cwd() : path.resolve(process.cwd(), projectName)
    };
}