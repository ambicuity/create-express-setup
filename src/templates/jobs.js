export function generateCronJob(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import { SmartCron } from 'cron-guardian';

const cronManager = new SmartCron();

cronManager.schedule('*/5 * * * *', async () => {
    console.log('Cron Job: Runs every 5 minutes');
}, {
    name: 'example-job',
    retries: 3,
    retryDelay: 5000,
    preventOverlap: true,
    onFailure: (error${isTS ? ': any' : ''}, job${isTS ? ': any' : ''}) => {
        console.error(\`Job \${job.name} failed:\`, error.message);
    }
});

export default cronManager;`;

    return { path: `src/jobs/index.${ext}`, content };
}