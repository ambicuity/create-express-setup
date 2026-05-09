export function generateUserRoutes(options) {
    const { language } = options;
    const isTS = language === 'ts';
    const ext = isTS ? 'ts' : 'js';

    const content = `import express from 'express';
import { getUsers, register, login, updateProfile, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', getUsers);
router.put('/profile', updateProfile);
router.delete('/:id', deleteUser);

export default router;`;

    return { path: `src/routes/user.routes.${ext}`, content };
}