export function generateDbConfig(options) {
    const { language, database } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    let imports = '';
    let connectionBody = '';

    if (database === 'mongodb') {
        imports = "import mongoose from 'mongoose';\n";
        connectionBody = `    try {
        await mongoose.connect(process.env.MONGODB_URL${isTS ? ' as string' : ''});
        console.log('MongoDB Connected');
    } catch (err${isTS ? ': any' : ''}) {
        console.error('MongoDB Error:', err.message);
    }`;
    } else if (['postgresql', 'mysql', 'sqlite'].includes(database)) {
        imports = "import { Sequelize } from 'sequelize';\n\nexport const sequelize = new Sequelize(process.env.SQL_DATABASE_URL" + (isTS ? ' as string' : '') + ");\n";
        connectionBody = `    try {
        await sequelize.authenticate();
        console.log('SQL Database Connected');
    } catch (err${isTS ? ': any' : ''}) {
        console.error('SQL Error:', err.message);
    }`;
    } else {
        connectionBody = "    console.log('No database configured. Skipping DB connection.');";
    }

    const content = `${imports}
const connectDB = async () => {
${connectionBody}
};

export default connectDB;`;

    return { path: `src/config/db.${ext}`, content };
}