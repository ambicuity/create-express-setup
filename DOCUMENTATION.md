# @ambicuity/create-express-setup Documentation

Comprehensive reference for the `@ambicuity/create-express-setup` CLI tool — a developer-first scaffolding tool for production-ready Express.js backends.

---

## Table of Contents

1. [CLI Flags and Arguments](#1-cli-flags-and-arguments)
2. [Prompt Options Explained](#2-prompt-options-explained)
3. [Language Selection](#3-language-selection)
4. [Database Options](#4-database-options)
5. [Middleware/Tools](#5-middlewaretools)
6. [Storage Options](#6-storage-options)
7. [Email Service Options](#7-email-service-options)
8. [TypeScript-Specific Notes](#8-typescript-specific-notes)
9. [Joi vs Zod Guidance](#9-joi-vs-zod-guidance)
10. [Extending Generated Projects](#10-extending-generated-projects)
11. [CRUD Generator Details](#11-crud-generator-details)
12. [Migrating from JavaScript to TypeScript](#12-migrating-from-javascript-to-typescript)
13. [Troubleshooting](#13-troubleshooting)
14. [Full Environment Variable Reference](#14-full-environment-variable-reference)

---

## 1. CLI Flags and Arguments

### Scaffold a new project with a directory name

```bash
npx @ambicuity/create-express-setup my-app
```

When a positional argument is provided, the CLI skips the project location prompt and uses the argument as the target directory name. The remaining prompts (language, database, middleware, storage, email, port) still appear interactively. If the directory already exists, the prompt will reject it and ask for a different name.

### Interactive guided setup (no arguments)

```bash
npx @ambicuity/create-express-setup
```

Running without any arguments launches the full interactive mode. The first prompt asks where to create the project:

- **Current Directory** (`.`) — scaffolds into the existing working directory.
- **New Directory** — prompts you to type a directory name (validated for emptiness).

### Generate CRUD operations for an existing model

```bash
npx @ambicuity/create-express-setup --crud Product
```

The `--crud` flag bypasses the full scaffolding flow entirely. It expects a model name as the next argument (`Product` in this example) and generates a controller, routes, and optional validator for that model inside the existing project directory. See [Section 11](#11-crud-generator-details) for full details.

---

## 2. Prompt Options Explained

The interactive flow presents these prompts in order:

| # | Prompt | Type | Description |
|---|--------|------|-------------|
| 1 | **Project Location** | `select` (only when no positional arg) | Choose between current directory or specify a new directory name. |
| 2 | **Language** | `select` | Choose TypeScript (`ts`) or JavaScript (`js`). Affects file extensions, type annotations, dev scripts, and `tsconfig.json` generation. |
| 3 | **Database** | `select` | Pick a database driver: MongoDB (Mongoose), PostgreSQL, MySQL, SQLite, or None. Determines the DB connection config, model file, and ORM dependencies. |
| 4 | **Middleware/Tools** | `multiselect` | Select any combination of middleware and dev tools. Defaults to `cors`, `helmet`, and `dotenv`. Can be empty. |
| 5 | **Storage** | `select` | Choose a file/media storage provider or local storage via Multer. Generates a corresponding service file under `src/services/`. |
| 6 | **Email Service** | `select` | Choose an email delivery provider or skip. Generates a `src/services/email.service.{ts\|js}` with the appropriate SDK. |
| 7 | **Port** | `text` | Enter the port number for the Express server. Defaults to `8080`. Must be numeric if provided. |

After all selections, a summary panel displays your choices. You can confirm to proceed or cancel to restart the prompts.

---

## 3. Language Selection

### TypeScript (recommended)

- **File extension**: `.ts` for all source files
- **Dev script**: `npm run dev` → `tsx watch src/index.ts` (instant hot-reload via tsx)
- **Build script**: `npm run build` → `tsc` (compiles `src/` to `dist/`)
- **Start script**: `npm run start` → `node dist/index.js`
- **Config**: A `tsconfig.json` is generated with `strict: true`, `ESNext` target, and `outDir: "./dist"`
- **Type annotations**: All generated controllers, middleware, and services include `: any` type annotations on `req`, `res`, `error` parameters, and `as string` casts on `process.env` reads
- **Zod type exports**: When Zod is selected, validators export `type Create*Input` and `type Update*Input` inferred from Zod schemas via `z.infer`
- **Dev dependencies**: `typescript`, `@types/node`, `@types/express`, `tsx` plus any relevant `@types/*` packages for selected middleware

### JavaScript

- **File extension**: `.js` for all source files
- **Dev script**: `npm run dev` → `nodemon src/index.js`
- **Start script**: `npm run start` → `node src/index.js`
- **No build step**: No `tsconfig.json` or build script is generated
- **Dev dependencies**: `nodemon` is included; no TypeScript tooling
- **Type annotations**: None — all parameters are untyped

---

## 4. Database Options

### MongoDB (Mongoose)

- **Dependency added**: `mongoose ^8.9.0`
- **Config file**: `src/config/db.{ts|js}` — connects to `MONGODB_URL` from environment
- **Model file**: `src/models/mongoUser.{ts|js}` — Mongoose `User` schema with `name`, `email`, `password` fields and `timestamps: true`
- **Env var**: `MONGODB_URL=mongodb://localhost:27017/mydb`
- **Controller**: Uses `MongoUser.find()`, `.create()`, `.findOne()`, `.findByIdAndUpdate()`, `.findByIdAndDelete()` from the User model

### PostgreSQL

- **Dependencies added**: `sequelize ^6.37.0`, `pg ^8.12.0`
- **Config file**: `src/config/db.{ts|js}` — creates a `Sequelize` instance from `SQL_DATABASE_URL`
- **Model file**: `src/models/User.{ts|js}` — Sequelize `define()` with `INTEGER` auto-increment PK, `STRING` name/email/password columns, `unique: true` on email
- **Env var**: `SQL_DATABASE_URL=postgres://user:pass@localhost:5432/mydb`

### MySQL

- **Dependencies added**: `sequelize ^6.37.0`, `mysql2 ^3.9.0`
- **Config file**: Same Sequelize-based config as PostgreSQL, connecting via `SQL_DATABASE_URL`
- **Model file**: Same Sequelize model structure as PostgreSQL
- **Env var**: `SQL_DATABASE_URL=postgres://user:pass@localhost:5432/mydb` (update the protocol and port for MySQL, e.g., `mysql://user:pass@localhost:3306/mydb`)

### SQLite

- **Dependencies added**: `sequelize ^6.37.0`, `sqlite3 ^5.1.7`
- **Config file**: Same Sequelize-based config as PostgreSQL/MySQL
- **Model file**: Same Sequelize model structure
- **Env var**: `SQL_DATABASE_URL=postgres://user:pass@localhost:5432/mydb` (update to your SQLite connection string, e.g., `sqlite::memory:` or `sqlite:///path/to/db.sqlite`)

### None

- **No database dependencies** are installed
- **Config file**: `src/config/db.{ts|js}` — logs `"No database configured. Skipping DB connection."`
- **No model file** is generated
- **Controller**: Uses in-memory arrays as placeholder data stores

---

## 5. Middleware/Tools

Each option is a multiselect; you can choose any combination (including none).

| Option | Package | What it does | When to use |
|--------|---------|-------------|-------------|
| **cors** | `cors ^2.8.5` | Enables Cross-Origin Resource Sharing so your API can be called from browser apps on different domains. Adds `app.use(cors())` to the server. | Recommended for any API that will be consumed by web frontends |
| **helmet** | `helmet ^8.0.0` | Sets security-related HTTP headers (e.g., `X-Content-Type-Options`, `X-Frame-Options`) to protect against common web vulnerabilities. | Recommended for all production deployments |
| **morgan** | `morgan ^1.10.0` | HTTP request logger middleware that outputs request logs in `dev` format to the console. | Useful during development for debugging request flow; optional in production where a custom logger may be preferred |
| **rateLimit** | `express-rate-limit ^7.2.0` | Rate-limits incoming requests per IP. Default configuration: 100 requests per 15-minute window. Generates `src/middlewares/rateLimit.{ts\|js}`. | Protect against brute-force and abuse; adjust `windowMs` and `max` to your needs |
| **cookieParser** | `cookie-parser ^1.4.6` | Parses `Cookie` header and populates `req.cookies`. | Required if your app uses cookies for auth sessions, CSRF tokens, or A/B testing |
| **dotenv** | `dotenv ^16.4.0` | Loads environment variables from `.env` into `process.env`. Imported as `import 'dotenv/config'` at the top of `index.{ts\|js}`. | Recommended for all projects using environment variables |
| **nodemon** | `nodemon ^3.1.0` | Auto-restarts the Node process when source files change. Only included for JavaScript projects (TypeScript projects use `tsx watch` instead). | Development convenience for JS projects; not needed in TS projects |
| **zod** | `zod ^3.24.0` | TypeScript-first schema validation library. Generates `src/validators/user.validator.{ts\|js}` with `createUserSchema`, `updateUserSchema`, `userIdSchema`. In TS projects, also exports inferred types. | Best for TypeScript projects — provides static type inference |
| **joi** | `joi ^17.13.0` | Schema validation library for JavaScript/TypeScript. Generates `src/validators/user.validator.{ts\|js}` with `createUserSchema`, `updateUserSchema`, `userIdSchema`. | Best for JavaScript projects or teams that prefer Joi's API |
| **cron** | `cron-guardian ^1.0.0` | Scheduled job runner with retry, overlap prevention, and failure callbacks. Generates `src/jobs/index.{ts\|js}` with an example job that runs every 5 minutes. | For background tasks, cleanup jobs, report generation, etc. |

---

## 6. Storage Options

| Option | Dependency | Service file | Description |
|--------|-----------|--------------|-------------|
| **Local (Multer)** | `multer ^1.4.5-lts.1` | `src/services/upload.service.{ts\|js}` | Disk storage using Multer with ` multer.diskStorage`. Files are saved to `uploads/` with a timestamped filename. An `uploads/` directory is auto-created. |
| **AWS S3** | `@aws-sdk/client-s3 ^3.500.0` | `src/services/s3.service.{ts\|js}` | Uploads file buffers to an S3 bucket using the `PutObjectCommand`. Credentials come from `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_BUCKET_NAME` env vars. |
| **Cloudinary** | `cloudinary ^2.5.0` | `src/services/cloudinary.service.{ts\|js}` | Configures Cloudinary with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Exports `uploadToCloudinary(filePath)` that calls `cloudinary.uploader.upload()`. |
| **Firebase Storage** | `@firebase/storage ^0.12.0` | `src/services/firebase.service.{ts\|js}` | Initializes a Firebase app with config from env vars and uses `getStorage`/`uploadBytes` to upload file buffers. Requires `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`. |
| **Uploadcare** | `@uploadcare/upload-client ^6.0.0` | `src/services/uploadcare.service.{ts\|js}` | Uses the Uploadcare client with `UPLOADCARE_PUBLIC_KEY`. Exports `uploadToUploadcare(file)` that uploads the file buffer with the original filename and content type. |
| **Mux (Video)** | `@mux/mux-node ^8.0.0` | `src/services/mux.service.{ts\|js}` | Creates video uploads via the Mux API using `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET`. Exports `uploadToMux(url)` that creates a new Mux asset with public playback policy. |
| **None** | — | — | No storage service is generated. |

---

## 7. Email Service Options

All email services generate a file named `src/services/email.service.{ts|js}` that exports a `sendEmail(to, subject, html)` function.

| Option | Dependency | Env vars generated |
|--------|-----------|-------------------|
| **Nodemailer (SMTP)** | `nodemailer ^6.9.14` | `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` |
| **SendGrid** | `@sendgrid/mail ^8.1.0` | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` |
| **Mailgun** | `mailgun.js ^4.0.0` | `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL` |
| **Brevo** | `@getbrevo/brevo ^2.0.0` | `BREVO_API_KEY`, `BREVO_FROM_EMAIL` |
| **Mailcheap** | `nodemailer ^6.9.14` | `MAILCHEAP_HOST`, `MAILCHEAP_PORT`, `MAILCHEAP_USER`, `MAILCHEAP_PASS`, `MAILCHEAP_FROM` |
| **None** | — | — |

**Nodemailer** and **Mailcheap** both use the `nodemailer` package with SMTP transport. The difference is the default env var names and SMTP host defaults. Mailcheap is pre-configured for Mailcheap's hosting (`smtp.mailcheap.co`), while Nodemailer leaves the host generic (`smtp.example.com`).

**SendGrid** uses the `@sendgrid/mail` SDK and authenticates with an API key.

**Mailgun** uses the `mailgun.js` SDK with `form-data` for multipart handling.

**Brevo** uses the `@getbrevo/brevo` SDK's `TransactionalEmailsApi` and `SendSmtpEmail` classes.

---

## 8. TypeScript-Specific Notes

### Build command

```bash
npm run build
```

This runs `tsc`, which compiles all TypeScript files under `src/` (as defined by `rootDir: "./src"` in `tsconfig.json`) into the `dist/` directory (`outDir: "./dist"`).

### tsconfig.json

The generated `tsconfig.json` uses these compiler options:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- `strict: true` enables all strict type-checking options (`noImplicitAny`, `strictNullChecks`, etc.)
- ESM modules are used throughout (`"type": "module"` in `package.json`, `"module": "ESNext"`)

### Type annotations in generated code

All generated controllers, services, and middleware include:

- `: any` type annotations on `req`, `res`, `next`, and `error` parameters
- `as string` type assertions on `process.env` reads (e.g., `process.env.MONGODB_URL as string`)

These annotations satisfy the strict TypeScript compiler while remaining easy to replace with proper types as your project evolves.

### Zod type exports

When Zod is selected in a TypeScript project, the generated validator file exports inferred types:

```typescript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

These types can be imported in controllers and services for full end-to-end type safety.

### Output directory

TypeScript compiles to `dist/`. The `npm run start` command runs `node dist/index.js`. Do not edit files in `dist/` directly — always edit source files in `src/` and rebuild.

---

## 9. Joi vs Zod Guidance

### Choose Zod when:

- You selected **TypeScript** as your language
- You want **type inference** — Zod schemas can generate TypeScript types automatically via `z.infer<>`, so your validation and type definitions never drift apart
- You prefer a **modern, concise API** with method chaining similar to TypeScript's type system
- You need **nested object validation** with strong typing

### Choose Joi when:

- You selected **JavaScript** as your language
- You want **browser support** (Zod is mostly Node-focused)
- Your team is already familiar with Joi from other projects
- You need **Joi-specific features** like ` Joi.string().domain()` or `Joi.string().ip()` that have direct Joi equivalents
- You are integrating with libraries that accept Joi schemas natively (e.g., Hapi/Joi ecosystem)

### If both are selected

The scaffold logic checks for Zod first. If `zod` is in your middleware list, the generated `src/validators/user.validator.{ts|js}` will use Zod schemas. Joi is only used as the validator if Zod is **not** selected but Joi is.

Similarly, in the CRUD generator, `zod` takes precedence over `joi`. If both `zod` and `joi` are found in `package.json` dependencies, the CRUD generator will produce Zod validators.

---

## 10. Extending Generated Projects

### Adding authentication

1. Install an auth library (e.g., `jsonwebtoken`, `bcryptjs`)
2. Create `src/middlewares/auth.middleware.{ts|js}` with JWT verification logic
3. Create `src/controllers/auth.controller.{ts|js}` for login/register endpoints
4. Create `src/routes/auth.routes.{ts|js}` and mount it in `src/index.{ts|js}`:
   ```javascript
   import authRoutes from './routes/auth.routes.js';
   app.use('/api/auth', authRoutes);
   ```

### Adding custom middleware

1. Create a new file in `src/middlewares/`, e.g., `src/middlewares/auth.middleware.{ts|js}`
2. Export the middleware function
3. Import and apply it in `src/index.{ts|js}` before your routes:
   ```javascript
   import { authMiddleware } from './middlewares/auth.middleware.js';
   app.use(authMiddleware);
   ```

### Adding additional routes

1. Create a controller in `src/controllers/`
2. Create a route file in `src/routes/` using `express.Router()`
3. Import and mount the route in `src/index.{ts|js}`:
   ```javascript
   import productRoutes from './routes/product.routes.js';
   app.use('/api/products', productRoutes);
   ```

### Connecting to a different database

1. Update `src/config/db.{ts|js}` with the new connection logic
2. Add the relevant database driver to your dependencies
3. Update the corresponding environment variables in `.env` and `.env.example`
4. Update or create new model files in `src/models/`

---

## 11. CRUD Generator Details

The CRUD generator is invoked via:

```bash
npx @ambicuity/create-express-setup --crud <ModelName>
```

### Auto-detection logic

The generator determines the ORM type and available fields through two mechanisms:

1. **Package.json inspection** — Checks `package.json` dependencies for `mongoose` or `sequelize`:
   - If `mongoose` is found → MongoDB mode
   - If `sequelize` is found → SQL mode

2. **Model content scanning** — Falls back to scanning the model file content:
   - If the model file contains `mongoose.Schema` → MongoDB mode
   - If the model file contains `DataTypes` → SQL mode
   - Otherwise → Generic mode (in-memory arrays)

### Language detection

The CLI checks for `tsconfig.json` in the current directory. If present, TypeScript mode is used (`.ts` extension). Otherwise, JavaScript mode (`.js` extension).

### Model file discovery

The generator looks for the model file in three locations (in order):

1. `src/models/<ModelName>.{ts|js}`
2. `src/models/<ModelName>.model.{ts|js}`
3. `src/models/<ModelName>.schema.{ts|js}`

If none are found, the process exits with an error.

### Field extraction

**MongoDB models**: A regex scans for `fieldName: { type: TypePath, required: bool, default: val, select: bool, unique: bool, enum: [...] }` patterns and extracts field metadata.

**Sequelize models**: A regex scans for `fieldName: { type: DataTypes.TYPE }` patterns and extracts field names and types.

**Generic models**: No field extraction; the validator will have no fields.

### Three model types

| Type | Detection | Controller behavior |
|------|-----------|-------------------|
| **MongoDB** | `mongoose` in package.json or `mongoose.Schema` in model | Uses Mongoose methods: `.find()`, `.create()`, `.findOne()`, `.findByIdAndUpdate()`, `.findByIdAndDelete()`. Includes pagination with `.skip()` and `.limit()`. |
| **SQL** | `sequelize` in package.json or `DataTypes` in model | Uses Sequelize methods: `.findAll()`, `.create()`, `.findOne()`, `.findByPk()`, `.update()`, `.destroy()`. Includes pagination with `.findAndCountAll()` and `offset`/`limit`. |
| **Generic** | Neither ORM detected | Uses an in-memory JavaScript array with `Date.now()` IDs. No persistence — data is lost on restart. |

### Generated files

| File | Description |
|------|-------------|
| `src/controllers/<model>.controller.{ts\|js}` | Full CRUD controller with `create`, `getAll`, `getById`, `update`, `delete` handlers |
| `src/routes/<model>.routes.{ts\|js}` | Express Router with `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `src/validators/<model>.validator.{ts\|js}` | (If Zod or Joi is installed) `create<Model>Schema`, `update<Model>Schema`, `<model>IdSchema`. In TS+Zod, also exports inferred types. |

### Mounting routes

After generation, add the new route to your main `src/index.{ts|js}`:

```javascript
import productRoutes from './routes/product.routes.js';
app.use('/api/products', productRoutes);
```

---

## 12. Migrating from JavaScript to TypeScript

Follow these steps to convert a generated JavaScript project to TypeScript:

### Step 1: Install TypeScript and type definitions

```bash
npm install -D typescript @types/node @types/express tsx
```

Install `@types/` packages for any middleware you selected:

```bash
npm install -D @types/cors @types/morgan @types/cookie-parser
```

### Step 2: Create tsconfig.json

Create a `tsconfig.json` in your project root:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### Step 3: Rename files

Rename all `.js` files in `src/` to `.ts`:

```bash
find src -name "*.js" -exec bash -c 'mv "$1" "${1%.js}.ts"' _ {} \;
```

### Step 4: Update imports

Ensure all local imports include the `.js` extension (Node ESM convention):

```typescript
import { errorHandler } from './middlewares/errorHandler.js';
```

### Step 5: Add type annotations

Replace untyped parameters with proper types or `: any` annotations, e.g.:

```typescript
export const getUsers = async (req: any, res: any) => { ... };
```

For proper typing, install `@types/express` and use `Request`/`Response`:

```typescript
import { Request, Response } from 'express';
export const getUsers = async (req: Request, res: Response) => { ... };
```

### Step 6: Update package.json scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Step 7: Remove nodemon

Since `tsx watch` replaces `nodemon`:

```bash
npm uninstall nodemon
```

### Step 8: Build and verify

```bash
npm run build
npm run start
```

Fix any compilation errors that appear. Common issues include missing type assertions on `process.env` reads (add `as string`) and implicit `any` type errors (add explicit annotations).

---

## 13. Troubleshooting

### Port already in use

**Error**: `EADDRINUSE: address already in use :::8080`

**Fix**:
- Change the `PORT` value in your `.env` file to an available port (e.g., `PORT=3000`)
- Or kill the process using the port:
  ```bash
  # macOS/Linux
  lsof -i :8080
  kill -9 <PID>
  # Windows
  netstat -ano | findstr :8080
  taskkill /PID <PID> /F
  ```

### Database connection failures

**MongoDB**: `MongooseError: connect ECONNREFUSED`
- Ensure MongoDB is running: `mongod` or check your cloud connection string
- Verify the `MONGODB_URL` in `.env` matches your server address and port
- For Atlas, ensure your IP is whitelisted and the connection string includes the correct credentials

**PostgreSQL/MySQL/SQLite**: `SequelizeConnectionError`
- Verify `SQL_DATABASE_URL` format: `postgres://user:password@host:port/database` or `mysql://user:password@host:port/database`
- Ensure the database server is running and accessible
- For PostgreSQL: check `pg_hba.conf` allows connections from your host
- For SQLite: use a file path like `sqlite://./database.sqlite` or `sqlite::memory:` for testing

### npm install failures

**Error**: `npm ERR! code ERESOLVE` or dependency conflicts
- Try `npm install --legacy-peer-deps`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Ensure you're using Node.js 18+ (`node -v`)

**Error**: `npm ERR! network request failed`
- Check your internet connection
- If behind a proxy, configure npm: `npm config set proxy http://proxy:port`
- Try switching registries: `npm config set registry https://registry.npmjs.org/`

### TypeScript compilation errors

**Error**: `Cannot find module '...' or its corresponding type declarations`
- Install missing type packages: `npm install -D @types/<package-name>`
- Common missing types: `@types/cors`, `@types/morgan`, `@types/cookie-parser`

**Error**: `Parameter 'req' implicitly has an 'any' type`
- Add explicit `: any` annotations to all handler parameters in `.ts` files
- Or set `"noImplicitAny": false` in `tsconfig.json` (not recommended)

**Error**: `Property 'env' does not exist on type ...`
- Ensure `dotenv/config` is imported at the top of `src/index.ts`
- Add `as string` type assertions to `process.env` reads: `process.env.PORT as string`

---

## 14. Full Environment Variable Reference

| Variable | Description | Required/Optional | Default |
|----------|-------------|-------------------|---------|
| `PORT` | Port the Express server listens on | Optional | `8080` |
| **MongoDB** | | | |
| `MONGODB_URL` | MongoDB connection string | Required if MongoDB selected | `mongodb://localhost:27017/mydb` |
| **PostgreSQL / MySQL / SQLite** | | | |
| `SQL_DATABASE_URL` | Sequelize database connection URL | Required if SQL DB selected | `postgres://user:pass@localhost:5432/mydb` |
| **AWS S3** | | | |
| `AWS_REGION` | AWS region for the S3 bucket | Required if S3 selected | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key with S3 permissions | Required if S3 selected | — |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Required if S3 selected | — |
| `AWS_BUCKET_NAME` | Target S3 bucket name | Required if S3 selected | — |
| **Cloudinary** | | | |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | Required if Cloudinary selected | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Required if Cloudinary selected | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Required if Cloudinary selected | — |
| **Firebase Storage** | | | |
| `FIREBASE_API_KEY` | Firebase web API key | Required if Firebase selected | — |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Required if Firebase selected | — |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Required if Firebase selected | — |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket URL | Required if Firebase selected | — |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Required if Firebase selected | — |
| `FIREBASE_APP_ID` | Firebase app ID | Required if Firebase selected | — |
| **Uploadcare** | | | |
| `UPLOADCARE_PUBLIC_KEY` | Uploadcare public key for uploads | Required if Uploadcare selected | — |
| **Mux** | | | |
| `MUX_TOKEN_ID` | Mux API token ID | Required if Mux selected | — |
| `MUX_TOKEN_SECRET` | Mux API token secret | Required if Mux selected | — |
| **Nodemailer** | | | |
| `MAIL_HOST` | SMTP server hostname | Required if Nodemailer selected | `smtp.example.com` |
| `MAIL_PORT` | SMTP server port | Required if Nodemailer selected | `587` |
| `MAIL_USER` | SMTP authentication username | Required if Nodemailer selected | — |
| `MAIL_PASS` | SMTP authentication password | Required if Nodemailer selected | — |
| `MAIL_FROM` | Sender email address and name | Required if Nodemailer selected | `"Your App" <noreply@example.com>` |
| **SendGrid** | | | |
| `SENDGRID_API_KEY` | SendGrid API key | Required if SendGrid selected | — |
| `SENDGRID_FROM_EMAIL` | Sender email address | Required if SendGrid selected | `noreply@example.com` |
| **Mailgun** | | | |
| `MAILGUN_API_KEY` | Mailgun API key | Required if Mailgun selected | — |
| `MAILGUN_DOMAIN` | Mailgun sending domain | Required if Mailgun selected | `mg.example.com` |
| `MAILGUN_FROM_EMAIL` | Sender email address | Required if Mailgun selected | `noreply@example.com` |
| **Brevo** | | | |
| `BREVO_API_KEY` | Brevo (formerly Sendinblue) API key | Required if Brevo selected | — |
| `BREVO_FROM_EMAIL` | Sender email address | Required if Brevo selected | `noreply@example.com` |
| **Mailcheap** | | | |
| `MAILCHEAP_HOST` | Mailcheap SMTP host | Required if Mailcheap selected | `smtp.mailcheap.co` |
| `MAILCHEAP_PORT` | Mailcheap SMTP port | Required if Mailcheap selected | `587` |
| `MAILCHEAP_USER` | Mailcheap SMTP username | Required if Mailcheap selected | — |
| `MAILCHEAP_PASS` | Mailcheap SMTP password | Required if Mailcheap selected | — |
| `MAILCHEAP_FROM` | Sender email address and name | Required if Mailcheap selected | `"Your App" <noreply@example.com>` |

> **Note**: All sensitive values (API keys, passwords, secrets) should be kept in `.env` (which is included in `.gitignore`) and never committed to version control. The generated `.env.example` file contains placeholder values for reference.