export function generateZodValidator(modelName, fields, options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';
    const capitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1);

    let fieldSchemas = '';
    fields.forEach(field => {
        let fieldSchema = `  ${field.name}: z`;
        switch (field.type) {
            case 'String': fieldSchema += '.string()'; break;
            case 'Number': fieldSchema += '.number()'; break;
            case 'Boolean': fieldSchema += '.boolean()'; break;
            case 'Date': fieldSchema += '.date()'; break;
            default: fieldSchema += '.any()';
        }
        if (field.required) fieldSchema += '.min(1)';
        else fieldSchema += '.optional()';
        if (field.enum) fieldSchema += `.enum([${field.enum.map(v => `'${v}'`).join(', ')}])`;
        fieldSchemas += fieldSchema + ',\n';
    });

    const typeExports = isTS ? `\n\nexport type Create${capitalized}Input = z.infer<typeof create${capitalized}Schema>;
export type Update${capitalized}Input = z.infer<typeof update${capitalized}Schema>;` : '';

    const content = `import { z } from 'zod';

export const create${capitalized}Schema = z.object({
${fieldSchemas}});

export const update${capitalized}Schema = z.object({
${fieldSchemas}}).partial();

export const ${modelName}IdSchema = z.object({
    id: z.string().min(1, 'ID is required')
});${typeExports}`;

    return { path: `src/validators/${modelName}.validator.${ext}`, content };
}

export function generateJoiValidator(modelName, fields, options) {
    const { language } = options;
    const ext = language === 'ts' ? 'ts' : 'js';
    const capitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1);

    let fieldSchemas = '';
    fields.forEach(field => {
        let fieldSchema = `  ${field.name}: Joi`;
        switch (field.type) {
            case 'String': fieldSchema += '.string()'; break;
            case 'Number': fieldSchema += '.number()'; break;
            case 'Boolean': fieldSchema += '.boolean()'; break;
            case 'Date': fieldSchema += '.date()'; break;
            default: fieldSchema += '.any()';
        }
        if (field.required) fieldSchema += '.required()';
        else fieldSchema += '.optional()';
        if (field.enum) fieldSchema += `.valid(${field.enum.map(v => `'${v}'`).join(', ')})`;
        fieldSchemas += fieldSchema + ',\n';
    });

    const content = `import Joi from 'joi';

export const create${capitalized}Schema = Joi.object({
${fieldSchemas}});

export const update${capitalized}Schema = Joi.object({
${fieldSchemas}}).min(1);

export const ${modelName}IdSchema = Joi.object({
    id: Joi.string().min(1).required()
});`;

    return { path: `src/validators/${modelName}.validator.${ext}`, content };
}

export function generateUserZodValidator(options) {
    const fields = [
        { name: 'name', type: 'String', required: true },
        { name: 'email', type: 'String', required: true },
        { name: 'password', type: 'String', required: true },
    ];
    return generateZodValidator('user', fields, options);
}

export function generateUserJoiValidator(options) {
    const fields = [
        { name: 'name', type: 'String', required: true },
        { name: 'email', type: 'String', required: true },
        { name: 'password', type: 'String', required: true },
    ];
    return generateJoiValidator('user', fields, options);
}