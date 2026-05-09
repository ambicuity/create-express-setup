export function generateUploadService(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

export const upload = multer({ storage });`;

    return { path: `src/services/upload.service.${ext}`, content };
}

export function generateS3Service(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: process.env.AWS_REGION${isTS ? ' as string' : ''},
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID${isTS ? ' as string' : ''},
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY${isTS ? ' as string' : ''}
    }
});

export const uploadToS3 = async (file${isTS ? ': any' : ''}) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME${isTS ? ' as string' : ''},
        Key: \`uploads/\${Date.now()}-\${file.originalname}\`,
        Body: file.buffer
    });
    return s3.send(command);
};`;

    return { path: `src/services/s3.service.${ext}`, content };
}

export function generateCloudinaryService(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME${isTS ? ' as string' : ''},
    api_key: process.env.CLOUDINARY_API_KEY${isTS ? ' as string' : ''},
    api_secret: process.env.CLOUDINARY_API_SECRET${isTS ? ' as string' : ''}
});

export const uploadToCloudinary = (filePath${isTS ? ': string' : ''}) => cloudinary.uploader.upload(filePath);`;

    return { path: `src/services/cloudinary.service.${ext}`, content };
}

export function generateFirebaseService(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY${isTS ? ' as string' : ''},
    authDomain: process.env.FIREBASE_AUTH_DOMAIN${isTS ? ' as string' : ''},
    projectId: process.env.FIREBASE_PROJECT_ID${isTS ? ' as string' : ''},
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET${isTS ? ' as string' : ''},
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID${isTS ? ' as string' : ''},
    appId: process.env.FIREBASE_APP_ID${isTS ? ' as string' : ''}
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const uploadToFirebase = async (file${isTS ? ': any' : ''}, filename${isTS ? ': string' : ''}) => {
    const storageRef = ref(storage, \`uploads/\${filename}\`);
    return uploadBytes(storageRef, file.buffer);
};`;

    return { path: `src/services/firebase.service.${ext}`, content };
}

export function generateUploadcareService(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import { UploadcareClient } from '@uploadcare/upload-client';

const client = new UploadcareClient({
    publicKey: process.env.UPLOADCARE_PUBLIC_KEY${isTS ? ' as string' : ''}
});

export const uploadToUploadcare = async (file${isTS ? ': any' : ''}) => {
    return client.uploadFile(file.buffer, {
        fileName: file.originalname,
        contentType: file.mimetype
    });
};`;

    return { path: `src/services/uploadcare.service.${ext}`, content };
}

export function generateMuxService(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import { Mux } from '@mux/mux-node';

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID${isTS ? ' as string' : ''},
    tokenSecret: process.env.MUX_TOKEN_SECRET${isTS ? ' as string' : ''}
});

export const uploadToMux = async (url${isTS ? ': string' : ''}) => {
    return mux.video.uploads.create({
        url,
        new_asset_settings: {
            playback_policy: 'public'
        }
    });
};`;

    return { path: `src/services/mux.service.${ext}`, content };
}

export function generateNodemailerService(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import nodemailer from 'nodemailer';

export const sendEmail = async (to${isTS ? ': string' : ''}, subject${isTS ? ': string' : ''}, html${isTS ? ': string' : ''}) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST${isTS ? ' as string' : ''},
        port: Number(process.env.MAIL_PORT),
        auth: { user: process.env.MAIL_USER${isTS ? ' as string' : ''}, pass: process.env.MAIL_PASS${isTS ? ' as string' : ''} }
    });
    await transporter.sendMail({
        from: process.env.MAIL_FROM${isTS ? ' as string' : ''},
        to,
        subject,
        html
    });
};`;

    return { path: `src/services/email.service.${ext}`, content };
}

export function generateSendgridService(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY${isTS ? ' as string' : ''});

export const sendEmail = async (to${isTS ? ': string' : ''}, subject${isTS ? ': string' : ''}, html${isTS ? ': string' : ''}) => {
    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL${isTS ? ' as string' : ''},
        subject,
        html
    };
    await sgMail.send(msg);
};`;

    return { path: `src/services/email.service.${ext}`, content };
}

export function generateMailgunService(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY${isTS ? ' as string' : ''}
});

export const sendEmail = async (to${isTS ? ': string' : ''}, subject${isTS ? ': string' : ''}, html${isTS ? ': string' : ''}) => {
    const data = {
        from: process.env.MAILGUN_FROM_EMAIL${isTS ? ' as string' : ''},
        to,
        subject,
        html
    };
    return mg.messages.create(process.env.MAILGUN_DOMAIN${isTS ? ' as string' : ''}, data);
};`;

    return { path: `src/services/email.service.${ext}`, content };
}

export function generateBrevoService(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY${isTS ? ' as string' : ''}
);

export const sendEmail = async (to${isTS ? ': string' : ''}, subject${isTS ? ': string' : ''}, html${isTS ? ': string' : ''}) => {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = { email: process.env.BREVO_FROM_EMAIL${isTS ? ' as string' : ''} };
    sendSmtpEmail.to = [{ email: to }];
    return apiInstance.sendTransacEmail(sendSmtpEmail);
};`;

    return { path: `src/services/email.service.${ext}`, content };
}

export function generateMailcheapService(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import nodemailer from 'nodemailer';

export const sendEmail = async (to${isTS ? ': string' : ''}, subject${isTS ? ': string' : ''}, html${isTS ? ': string' : ''}) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAILCHEAP_HOST${isTS ? ' as string' : ''},
        port: Number(process.env.MAILCHEAP_PORT),
        auth: {
            user: process.env.MAILCHEAP_USER${isTS ? ' as string' : ''},
            pass: process.env.MAILCHEAP_PASS${isTS ? ' as string' : ''}
        }
    });
    await transporter.sendMail({
        from: process.env.MAILCHEAP_FROM${isTS ? ' as string' : ''},
        to,
        subject,
        html
    });
};`;

    return { path: `src/services/email.service.${ext}`, content };
}