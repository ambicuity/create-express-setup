export function generateEnvContent(options) {
    const { database, storage, emailService, port } = options;

    const lines = [`PORT=${port}`];

    if (database === 'mongodb') lines.push('MONGODB_URL=mongodb://localhost:27017/mydb');
    if (['postgresql', 'mysql', 'sqlite'].includes(database)) lines.push('SQL_DATABASE_URL=postgres://user:pass@localhost:5432/mydb');

    if (storage === 's3') {
        lines.push('AWS_REGION=us-east-1', 'AWS_ACCESS_KEY_ID=your_access_key', 'AWS_SECRET_ACCESS_KEY=your_secret_key', 'AWS_BUCKET_NAME=your_bucket_name');
    }
    if (storage === 'cloudinary') {
        lines.push('CLOUDINARY_CLOUD_NAME=your_cloud_name', 'CLOUDINARY_API_KEY=your_api_key', 'CLOUDINARY_API_SECRET=your_api_secret');
    }
    if (storage === 'firebase') {
        lines.push('FIREBASE_API_KEY=your_firebase_api_key', 'FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com', 'FIREBASE_PROJECT_ID=your_project_id', 'FIREBASE_STORAGE_BUCKET=your_project.appspot.com', 'FIREBASE_MESSAGING_SENDER_ID=123456789', 'FIREBASE_APP_ID=1:123456789:web:abcdef');
    }
    if (storage === 'uploadcare') {
        lines.push('UPLOADCARE_PUBLIC_KEY=your_uploadcare_public_key');
    }
    if (storage === 'mux') {
        lines.push('MUX_TOKEN_ID=your_mux_token_id', 'MUX_TOKEN_SECRET=your_mux_token_secret');
    }

    if (emailService === 'nodemailer') {
        lines.push('MAIL_HOST=smtp.example.com', 'MAIL_PORT=587', 'MAIL_USER=your_email@example.com', 'MAIL_PASS=your_password', 'MAIL_FROM="Your App" <noreply@example.com>');
    }
    if (emailService === 'sendgrid') {
        lines.push('SENDGRID_API_KEY=your_sendgrid_api_key', 'SENDGRID_FROM_EMAIL=noreply@example.com');
    }
    if (emailService === 'mailgun') {
        lines.push('MAILGUN_API_KEY=your_mailgun_api_key', 'MAILGUN_DOMAIN=mg.example.com', 'MAILGUN_FROM_EMAIL=noreply@example.com');
    }
    if (emailService === 'brevo') {
        lines.push('BREVO_API_KEY=your_brevo_api_key', 'BREVO_FROM_EMAIL=noreply@example.com');
    }
    if (emailService === 'mailcheap') {
        lines.push('MAILCHEAP_HOST=smtp.mailcheap.co', 'MAILCHEAP_PORT=587', 'MAILCHEAP_USER=your_email@example.com', 'MAILCHEAP_PASS=your_password', 'MAILCHEAP_FROM="Your App" <noreply@example.com>');
    }

    return lines.join('\n') + '\n';
}

export function generateGitignore() {
    return `node_modules\n.env\nuploads\n`;
}