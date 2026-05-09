export function generateMongoUserModel(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

export const MongoUser = mongoose.model('User', userSchema);`;

    return { path: `src/models/mongoUser.${ext}`, content };
}

export function generateSequelizeUserModel(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import { Sequelize, DataTypes } from 'sequelize';

export const createUserModel = (sequelize${isTS ? ': any' : ''}) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: true
    });

    return User;
};`;

    return { path: `src/models/User.${ext}`, content };
}