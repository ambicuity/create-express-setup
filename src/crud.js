import { intro, outro, spinner } from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { capitalize, getExt, isTypeScript } from './utils.js';
import { generateZodValidator, generateJoiValidator } from './templates/validators.js';

export async function generateCRUD(modelName) {
    intro(chalk.bgMagenta.black(` CRUD Generator for ${modelName} `));

    const s = spinner();

    if (!fs.existsSync('src') || !fs.existsSync('src/models')) {
        outro(chalk.red('Error: Not in a valid backend project directory. Make sure you have src/models folder.'));
        process.exit(1);
    }

    const language = fs.existsSync('tsconfig.json') ? 'ts' : 'js';
    const isTS = isTypeScript(language);
    const ext = getExt(language);

    s.start(`Looking for ${modelName} model...`);

    const modelPath = path.join('src', 'models', `${modelName}.${ext}`);
    const modelPathAlt = path.join('src', 'models', `${modelName}.model.${ext}`);
    const modelPathSchema = path.join('src', 'models', `${modelName}.schema.${ext}`);

    let finalModelPath = null;
    if (fs.existsSync(modelPath)) finalModelPath = modelPath;
    else if (fs.existsSync(modelPathAlt)) finalModelPath = modelPathAlt;
    else if (fs.existsSync(modelPathSchema)) finalModelPath = modelPathSchema;

    if (!finalModelPath) {
        s.stop('Model not found');
        outro(chalk.red(`Error: Model file for "${modelName}" not found in src/models/`));
        process.exit(1);
    }

    s.stop('Model found');

    const modelContent = await fs.readFile(finalModelPath, 'utf-8');
    const options = { language };

    const packageJson = fs.existsSync('package.json') ? await fs.readJSON('package.json') : {};
    const hasMongoose = !!packageJson.dependencies?.mongoose;
    const hasSequelize = !!packageJson.dependencies?.sequelize;

    let schemaFields = [];
    let ormType = 'generic';

    if (hasMongoose || modelContent.includes('mongoose.Schema')) {
        schemaFields = extractMongooseFields(modelContent);
        ormType = 'mongodb';
    } else if (hasSequelize || modelContent.includes('DataTypes')) {
        schemaFields = extractSequelizeFields(modelContent);
        ormType = 'sql';
    } else {
        schemaFields = [];
        ormType = 'generic';
    }

    s.start('Generating CRUD controller...');
    const controllerContent = generateCrudController(modelName, schemaFields, ormType, options);
    await fs.ensureDir('src/controllers');
    await fs.writeFile(path.join('src', 'controllers', `${modelName}.controller.${ext}`), controllerContent);
    s.stop('Controller generated');

    s.start('Generating CRUD routes...');
    const routeContent = generateCrudRoutes(modelName, options);
    await fs.ensureDir('src/routes');
    await fs.writeFile(path.join('src', 'routes', `${modelName}.routes.${ext}`), routeContent);
    s.stop('Routes generated');

    const hasZod = !!packageJson.dependencies?.zod;
    const hasJoi = !!packageJson.dependencies?.joi;

    if (hasZod || (hasJoi && !hasZod)) {
        s.start('Generating validation schemas...');
        await fs.ensureDir('src/validators');

        const validatorOptions = { language };
        if (hasZod) {
            const validator = generateZodValidator(modelName, schemaFields, validatorOptions);
            await fs.writeFile(path.join('src', 'validators', `${modelName}.validator.${ext}`), validator.content);
        } else {
            const validator = generateJoiValidator(modelName, schemaFields, validatorOptions);
            await fs.writeFile(path.join('src', 'validators', `${modelName}.validator.${ext}`), validator.content);
        }
        s.stop('Validation schemas generated');
    }

    outro(`${chalk.green('CRUD operations generated successfully!')}

${chalk.bold('Generated files:')}
${chalk.cyan(`  • src/controllers/${modelName}.controller.${ext}`)}
${chalk.cyan(`  • src/routes/${modelName}.routes.${ext}`)}
${(hasZod || hasJoi) ? chalk.cyan(`  • src/validators/${modelName}.validator.${ext}`) : ''}

${chalk.bold('Next steps:')}
${chalk.cyan(`  • Import and use the routes in your main app file`)}
${chalk.cyan(`  • Example: app.use('/api/${modelName.toLowerCase()}', ${modelName}Routes)`)}
`);
}

function extractMongooseFields(content) {
    const fields = [];
    const schemaRegex = /(\w+):\s*{\s*type:\s*([^,}]+)(?:,\s*required:\s*([^,}]+))?(?:,\s*default:\s*([^,}]+))?(?:,\s*select:\s*([^,}]+))?(?:,\s*unique:\s*([^,}]+))?(?:,\s*enum:\s*\[([^\]]+)\])?[^}]*}/g;

    let match;
    while ((match = schemaRegex.exec(content)) !== null) {
        const fieldName = match[1];
        const fieldType = match[2].trim();
        const required = match[3] === 'true';
        const unique = match[6] === 'true';
        const enumValues = match[7] ? match[7].split(',').map(v => v.trim().replace(/['"]/g, '')) : null;

        fields.push({ name: fieldName, type: fieldType, required, unique, enum: enumValues });
    }

    return fields;
}

function extractSequelizeFields(content) {
    const fields = [];
    const fieldRegex = /(\w+):\s*{\s*type:\s*DataTypes\.(\w+)/g;

    let match;
    while ((match = fieldRegex.exec(content)) !== null) {
        fields.push({
            name: match[1],
            type: match[2],
            required: false
        });
    }

    return fields;
}

function generateCrudController(modelName, fields, ormType, options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';
    const capName = capitalize(modelName);
    const typeAnnotation = isTS ? ': any' : '';

    let importLine = '';
    let modelRef = '';

    if (ormType === 'mongodb') {
        modelRef = capitalize(modelName);
        importLine = `import { MongoUser } from '../models/mongoUser.js';\n`;
    } else if (ormType === 'sql') {
        modelRef = capName;
        importLine = `import { sequelize } from '../config/db.js';\nimport { createUserModel } from '../models/User.js';\n\nconst ${capName} = createUserModel(sequelize);\n`;
    } else {
        modelRef = capName;
        importLine = '';
    }

    let crudImplementations = '';

    if (ormType === 'mongodb') {
        crudImplementations = `
export const create${capName} = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const new${capName} = new ${modelRef}(req.body);
        const saved${capName} = await new${capName}.save();
        res.status(201).json({ success: true, data: saved${capName} });
    } catch (error${typeAnnotation}) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAll${capName}s = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const items = await ${modelRef}.find().skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await ${modelRef}.countDocuments();
        res.status(200).json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error${typeAnnotation}) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const get${capName}ById = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const item = await ${modelRef}.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: '${capName} not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error${typeAnnotation}) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const update${capName} = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const item = await ${modelRef}.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ success: false, message: '${capName} not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error${typeAnnotation}) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const delete${capName} = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const item = await ${modelRef}.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: '${capName} not found' });
        res.status(200).json({ success: true, message: '${capName} deleted successfully' });
    } catch (error${typeAnnotation}) {
        res.status(500).json({ success: false, message: error.message });
    }
};`;
    } else if (ormType === 'sql') {
        crudImplementations = `
export const create${capName} = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const item = await ${modelRef}.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error${typeAnnotation}) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAll${capName}s = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { rows: items, count: total } = await ${modelRef}.findAndCountAll({ limit, offset, order: [['createdAt', 'DESC']] });
        res.status(200).json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error${typeAnnotation}) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const get${capName}ById = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const item = await ${modelRef}.findByPk(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: '${capName} not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error${typeAnnotation}) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const update${capName} = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const [updated] = await ${modelRef}.update(req.body, { where: { id: req.params.id } });
        if (!updated) return res.status(404).json({ success: false, message: '${capName} not found' });
        const item = await ${modelRef}.findByPk(req.params.id);
        res.status(200).json({ success: true, data: item });
    } catch (error${typeAnnotation}) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const delete${capName} = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const deleted = await ${modelRef}.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ success: false, message: '${capName} not found' });
        res.status(200).json({ success: true, message: '${capName} deleted successfully' });
    } catch (error${typeAnnotation}) {
        res.status(500).json({ success: false, message: error.message });
    }
};`;
    } else {
        crudImplementations = `
const items = [];

export const create${capName} = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const item = { id: Date.now().toString(), ...req.body };
        items.push(item);
        res.status(201).json({ success: true, data: item });
    } catch (error${typeAnnotation}) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAll${capName}s = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        res.status(200).json({ success: true, data: items });
    } catch (error${typeAnnotation}) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const get${capName}ById = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const item = items.find(i => i.id === req.params.id);
        if (!item) return res.status(404).json({ success: false, message: '${capName} not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error${typeAnnotation}) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const update${capName} = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const index = items.findIndex(i => i.id === req.params.id);
        if (index === -1) return res.status(404).json({ success: false, message: '${capName} not found' });
        items[index] = { ...items[index], ...req.body };
        res.status(200).json({ success: true, data: items[index] });
    } catch (error${typeAnnotation}) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const delete${capName} = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const index = items.findIndex(i => i.id === req.params.id);
        if (index === -1) return res.status(404).json({ success: false, message: '${capName} not found' });
        items.splice(index, 1);
        res.status(200).json({ success: true, message: '${capName} deleted successfully' });
    } catch (error${typeAnnotation}) {
        res.status(500).json({ success: false, message: error.message });
    }
};`;
    }

    return `${importLine}
${crudImplementations}
`;
}

function generateCrudRoutes(modelName, options) {
    const { language } = options;
    const ext = language === 'ts' ? 'ts' : 'js';
    const capName = capitalize(modelName);

    return `import express from 'express';
import {
    create${capName},
    getAll${capName}s,
    get${capName}ById,
    update${capName},
    delete${capName}
} from '../controllers/${modelName}.controller.js';

const router = express.Router();

router.post('/', create${capName});
router.get('/', getAll${capName}s);
router.get('/:id', get${capName}ById);
router.put('/:id', update${capName});
router.delete('/:id', delete${capName});

export default router;
`;
}