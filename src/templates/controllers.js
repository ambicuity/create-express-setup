export function generateUserController(options) {
    const { language, database } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';
    const typeAnnotation = isTS ? ': any' : '';

    let modelImport = '';
    if (database === 'mongodb') {
        modelImport = "import { MongoUser } from '../models/mongoUser.js';\n";
    } else if (['postgresql', 'mysql', 'sqlite'].includes(database)) {
        modelImport = "import { sequelize } from '../config/db.js';\nimport { createUserModel } from '../models/User.js';\n\nconst User = createUserModel(sequelize);\n";
    }

    let modelRef = '';
    if (database === 'mongodb') {
        modelRef = 'MongoUser';
    } else if (['postgresql', 'mysql', 'sqlite'].includes(database)) {
        modelRef = 'User';
    }

    let getUsersBody, registerBody, loginBody, updateProfileBody, deleteUserBody;

    if (database === 'mongodb') {
        getUsersBody = `const users = await ${modelRef}.find();`;
        registerBody = `const user = await ${modelRef}.create({ name, email, password });`;
        loginBody = `const user = await ${modelRef}.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });`;
        updateProfileBody = `const user = await ${modelRef}.findByIdAndUpdate(req.params.id, { name }, { new: true });`;
        deleteUserBody = `await ${modelRef}.findByIdAndDelete(req.params.id);`;
    } else if (['postgresql', 'mysql', 'sqlite'].includes(database)) {
        getUsersBody = `const users = await ${modelRef}.findAll();`;
        registerBody = `const user = await ${modelRef}.create({ name, email, password });`;
        loginBody = `const user = await ${modelRef}.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });`;
        updateProfileBody = `const user = await ${modelRef}.update({ name }, { where: { id: req.params.id } });`;
        deleteUserBody = `await ${modelRef}.destroy({ where: { id: req.params.id } });`;
    } else {
        getUsersBody = 'const users = [];';
        registerBody = 'const user = { name, email, password };';
        loginBody = `const user = null;
        if (!user) return res.status(404).json({ message: 'User not found' });`;
        updateProfileBody = 'const user = { name };';
        deleteUserBody = '';
    }

    const content = `${modelImport}import { logger } from '../middlewares/logger.js';

export const getUsers = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        ${getUsersBody}
        res.json(users);
    } catch (err${typeAnnotation}) {
        res.status(500).json({ message: err.message });
    }
};

export const register = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const { name, email, password } = req.body;
        ${registerBody}
        res.status(201).json(user);
    } catch (err${typeAnnotation}) {
        res.status(400).json({ message: err.message });
    }
};

export const login = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const { email, password } = req.body;
        ${loginBody}
        res.json({ user });
    } catch (err${typeAnnotation}) {
        res.status(500).json({ message: err.message });
    }
};

export const updateProfile = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        const { name } = req.body;
        ${updateProfileBody}
        res.json(user);
    } catch (err${typeAnnotation}) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteUser = async (req${typeAnnotation}, res${typeAnnotation}) => {
    try {
        ${deleteUserBody}
        res.json({ message: 'User deleted' });
    } catch (err${typeAnnotation}) {
        res.status(500).json({ message: err.message });
    }
};`;

    return { path: `src/controllers/user.controller.${ext}`, content };
}