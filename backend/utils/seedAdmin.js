import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'genz.skinstudio@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin12345@';
    const existing = await User.findOne({ email });
    if (!existing) {
      await User.create({ name: 'Admin', email, password, role: 'admin' });
      console.log('Admin user created');
    } else {
      const isMatch = await existing.matchPassword(password);
      if (!isMatch) {
        existing.password = password;
        await existing.save();
        console.log('Admin password updated to match current configuration');
      }
    }
  } catch (err) {
    console.error('seedAdmin error:', err.message);
  }
};

export default seedAdmin;
