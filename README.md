# @ambicuity/create-express-setup

A robust, developer-first CLI tool for scaffolding production-ready Express.js applications instantly — just like create-react-app but for your Node.js backend.

---

## Quick Start

**Requirements:** Node.js >= 18.0.0

Create a new project in a named directory:

```bash
npx @ambicuity/create-express-setup my-app
```

Or scaffold in the current directory:

```bash
npx @ambicuity/create-express-setup
```

### Example CLI Session

```
🚀 Backend Scaffolder CLI
════════════════════════════════════════════════════════════
💡 Press Ctrl+C anytime to exit
════════════════════════════════════════════════════════════

❯ 📁 Where should we create the project?
  📂 Current Directory
  📁 New Directory

❯ 🔧 Choose your language:
  ● TypeScript
  ● JavaScript

❯ 🗄️  Choose your Database:
  🍃 MongoDB (Mongoose)
  🐘 PostgreSQL
  🐬 MySQL
  📦 SQLite
  ❌ None

❯ ⚙️  Select the tools you want to include:
  ● CORS (Cross-Origin Resource Sharing)  [Recommended]
  ● Helmet (Security Headers)              [Recommended]
  ○ Morgan (HTTP Request Logger)           [Optional]
  ○ Rate Limit (API Rate Limiting)         [Optional]
  ○ Cookie Parser (Cookie Handling)         [Optional]
  ● Dotenv (Environment Variables)          [Recommended]
  ○ Nodemon (Auto-restart Dev)              [Optional]
  ○ Zod (Schema Validation)                 [Optional]
  ○ Joi (Schema Validation)                 [Optional]
  ○ Cron Jobs (cron-guardian)               [Advanced]

❯ 📁 Where will you store media/files?
  💾 Local (Multer)
  ☁️  AWS S3
  🌤️  Cloudinary
  🔥 Firebase Storage
  ⬆️  Uploadcare
  🎥 Mux (Video)
  ❌ None

❯ 📧 Choose your Email Service:
  ❌ None
  📮 Nodemailer (SMTP)
  📬 SendGrid
  🔫 Mailgun
  📨 Brevo (formerly Sendinblue)
  💰 Mailcheap

❯ 🌐 Select Port (default: 8080): 8080
```

---

## CLI Experience

### Progress Feedback

```
◒ Scaffolding project structure...
  Generating package.json...
  Generating src/index...
  Generating config/db...
  Generating middlewares/logger...
  Generating middlewares/errorHandler...
  Generating User CRUD controllers...
  Generating User routes...
  Generating .env...
✔ Files generated.

◒ Installing dependencies...
✔ Dependencies installed.

◒ Initializing Git...
✔ Git initialized.
```

### Success Output

```
✅ Project scaffolded successfully!

════════════════════════════════════════════════════════════
Next steps:
  cd my-app
  npm run dev
════════════════════════════════════════════════════════════
📦 Dependencies installed and Git initialized.
```

---

## Supported Packages

### Databases

| Package | Version | Use |
|---------|---------|-----|
| mongoose | ^8.9.0 | MongoDB ODM |
| sequelize | ^6.37.0 | SQL ORM |
| pg | ^8.12.0 | PostgreSQL client |
| mysql2 | ^3.9.0 | MySQL client |
| sqlite3 | ^5.1.7 | SQLite client |

### Security & Middleware

| Package | Version | Use |
|---------|---------|-----|
| helmet | ^8.0.0 | Security headers |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |
| express-rate-limit | ^7.2.0 | API rate limiting |
| cookie-parser | ^1.4.6 | Cookie parsing |
| morgan | ^1.10.0 | HTTP request logging |
| dotenv | ^16.4.0 | Environment variables |
| zod | ^3.24.0 | Schema validation (TypeScript-first) |
| joi | ^17.13.0 | Schema validation |
| nodemon | ^3.1.0 | Auto-restart on file changes |
| cron-guardian | ^1.0.0 | Advanced cron job management |

### Cloud Services & Utils

| Package | Version | Use |
|---------|---------|-----|
| multer | ^1.4.5-lts.1 | Local file uploads |
| @aws-sdk/client-s3 | ^3.500.0 | AWS S3 file storage |
| cloudinary | ^2.5.0 | Cloudinary media uploads |
| @firebase/storage | ^0.12.0 | Firebase Storage |
| @uploadcare/upload-client | ^6.0.0 | Uploadcare file handling |
| @mux/mux-node | ^8.0.0 | Mux video streaming |
| nodemailer | ^6.9.14 | SMTP email delivery |
| @sendgrid/mail | ^8.1.0 | SendGrid email API |
| mailgun.js | ^4.0.0 | Mailgun email API |
| @getbrevo/brevo | ^2.0.0 | Brevo (Sendinblue) email API |

---

## What Gets Generated

| File | Purpose |
|------|---------|
| `src/index` | Express app entry point with middleware setup and server startup |
| `src/config/db` | Database connection (MongoDB via Mongoose or SQL via Sequelize) |
| `src/controllers/user.controller` | CRUD controller for User model |
| `src/middlewares/errorHandler` | Global error handling middleware |
| `src/middlewares/logger` | Custom request logger with duration, IP, and user-agent |
| `src/routes/user.routes` | REST routes for User resource (`/api/users`) |
| `.env.example` | Template environment file with all required variables |
| `tsconfig.json` | TypeScript configuration (TypeScript projects only) |

Conditional files generated based on selections:

| Condition | Generated Files |
|-----------|----------------|
| Zod selected | `src/validators/user.validator` |
| Joi selected | `src/validators/user.validator` |
| Rate Limit selected | `src/middlewares/rateLimit` |
| Cron selected | `src/jobs/index` |
| Local storage | `src/services/upload.service` + `uploads/` directory |
| S3 storage | `src/services/s3.service` |
| Cloudinary storage | `src/services/cloudinary.service` |
| Firebase storage | `src/services/firebase.service` |
| Uploadcare storage | `src/services/uploadcare.service` |
| Mux storage | `src/services/mux.service` |
| Any email service | `src/services/email.service` |

---

## Project Structure

Example output for a **MongoDB** project with all features (TypeScript):

```
my-app/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── uploads/                    # Local file upload directory
└── src/
    ├── index.ts                # App entry point
    ├── config/
    │   └── db.ts               # Database connection
    ├── controllers/
    │   └── user.controller.ts   # User CRUD operations
    ├── jobs/
    │   └── index.ts            # Cron job definitions (cron-guardian)
    ├── middlewares/
    │   ├── errorHandler.ts      # Global error handler
    │   ├── logger.ts            # Request logger
    │   └── rateLimit.ts         # Rate limiting middleware
    ├── models/
    │   └── mongoUser.ts         # Mongoose User schema
    ├── routes/
    │   └── user.routes.ts       # User REST routes
    ├── services/
    │   ├── email.service.ts     # Email delivery service
    │   └── upload.service.ts    # File upload service
    ├── utils/
    └── validators/
        └── user.validator.ts    # Zod/Joi validation schemas
```

---

## Feature Details

### Advanced Cron Jobs (cron-guardian)

When you select **Cron Jobs**, the scaffold generates `src/jobs/index` powered by [cron-guardian](https://www.npmjs.com/package/cron-guardian):

```js
import { SmartCron } from 'cron-guardian';

const cronManager = new SmartCron();

cronManager.schedule('*/5 * * * *', async () => {
    console.log('Cron Job: Runs every 5 minutes');
}, {
    name: 'example-job',
    retries: 3,
    retryDelay: 5000,
    preventOverlap: true,
    onFailure: (error, job) => {
        console.error(`Job ${job.name} failed:`, error.message);
    }
});

export default cronManager;
```

**Features included:**
- Automatic retries with configurable delay
- Overlap prevention for long-running jobs
- Named jobs for easy management
- Failure callbacks for observability

### Resource Generator

Generate a full CRUD resource (controller, routes, and validator) from an existing model:

```bash
npx @ambicuity/create-express-setup --crud Product
```

**What it generates:**

| File | Description |
|------|-------------|
| `src/controllers/Product.controller.js` | CRUD operations: create, getAll, getById, update, delete |
| `src/routes/Product.routes.js` | REST routes (`POST /`, `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id`) |
| `src/validators/Product.validator.js` | Validation schemas (if zod or joi is installed) |

The generator auto-detects your ORM:

| ORM Detected | Behavior |
|--------------|----------|
| **Mongoose** | Uses `Model.findById`, `Model.findByIdAndUpdate`, pagination with `.skip()/.limit()` |
| **Sequelize** | Uses `Model.findByPk`, `Model.update`, pagination with `.findAndCountAll()` |
| **Generic** | In-memory array-based CRUD (no database dependency) |

### Adding New Resources

1. **Define your model** — create a file in `src/models/` (e.g., `src/models/Product.js`)
2. **Generate CRUD** — run `npx @ambicuity/create-express-setup --crud Product`
3. **Mount the routes** — in `src/index.js`:

```js
import productRoutes from './routes/Product.routes.js';
app.use('/api/products', productRoutes);
```

### Adding Cron Jobs

Edit `src/jobs/index.js` and add new scheduled tasks using `cronManager.schedule`:

```js
cronManager.schedule('0 0 * * *', async () => {
    console.log(' Midnight cleanup job');
}, {
    name: 'cleanup-job',
    retries: 3,
    retryDelay: 10000,
    preventOverlap: true,
    onFailure: (error, job) => {
        console.error(`Job ${job.name} failed:`, error.message);
    }
});
```

### Error Handling

Every scaffolded project includes a global error handler at `src/middlewares/errorHandler`:

```js
export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
        error: {
            message: err.message || 'Internal Server Error',
            status
        }
    });
};
```

Throw errors in your controllers and the handler catches them:

```js
export const getUser = async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    res.json({ success: true, data: user });
};
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| **Server** | |
| `PORT` | Server port (default: 8080) |
| **Database** | |
| `MONGODB_URL` | MongoDB connection string |
| `SQL_DATABASE_URL` | SQL database connection string (PostgreSQL/MySQL/SQLite) |
| **AWS S3** | |
| `AWS_REGION` | AWS region |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_BUCKET_NAME` | S3 bucket name |
| **Cloudinary** | |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| **Firebase** | |
| `FIREBASE_API_KEY` | Firebase API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | Firebase app ID |
| **Uploadcare** | |
| `UPLOADCARE_PUBLIC_KEY` | Uploadcare public key |
| **Mux** | |
| `MUX_TOKEN_ID` | Mux token ID |
| `MUX_TOKEN_SECRET` | Mux token secret |
| **Nodemailer / Mailcheap** | |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USER` | SMTP username |
| `MAIL_PASS` | SMTP password |
| `MAIL_FROM` | Sender email address |
| **SendGrid** | |
| `SENDGRID_API_KEY` | SendGrid API key |
| `SENDGRID_FROM_EMAIL` | Sender email address |
| **Mailgun** | |
| `MAILGUN_API_KEY` | Mailgun API key |
| `MAILGUN_DOMAIN` | Mailgun domain |
| `MAILGUN_FROM_EMAIL` | Sender email address |
| **Brevo** | |
| `BREVO_API_KEY` | Brevo API key |
| `BREVO_FROM_EMAIL` | Sender email address |

---

## Available Scripts

### TypeScript Projects

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot-reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/index.js` |

### JavaScript Projects

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Nodemon auto-restart |
| `npm start` | Run `node src/index.js` |

---

## API Reference

### Health Check

```
GET /
```

**Response:**

```json
{
  "message": "API is running"
}
```

### User Routes

```
POST   /api/users          Create a new user
GET    /api/users           List all users (with pagination)
GET    /api/users/:id       Get user by ID
PUT    /api/users/:id       Update user by ID
DELETE /api/users/:id       Delete user by ID
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License

Copyright 2026 Ritesh Rana

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.