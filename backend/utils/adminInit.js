import Users from '../models/Users.js';

export const initializeAdmin = async () => {
    try {
        const initialUsername = process.env.INITIAL_ADMIN_USERNAME;
        const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;

        if (!initialUsername || !initialPassword) {
            console.log('Initial admin credentials not configured in .env');
            return;
        }

        const existingAdmin = await Users.findOne({
            role: 'admin',
            isDeleted: false
        });

        if (existingAdmin) return
        const admin = await Users.create({
            username: initialUsername,
            password: initialPassword, 
            role: 'admin'
        });

        console.log(`Initial admin user '${admin.username}' created successfully`);
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
};


