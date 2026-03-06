require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

const CANONICAL_ROLES = new Set(['farmer', 'agripreneur', 'officer', 'admin']);
const LEGACY_ROLE_MAP = {
  agriprenuer: 'agripreneur',
};

const normalizeRole = (role = '') => {
  const normalized = String(role).trim().toLowerCase();
  return LEGACY_ROLE_MAP[normalized] || normalized;
};

async function migrateRolesToCanonical() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required to run migration.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find({}, { role: 1 });
  let updated = 0;
  const unresolved = [];

  for (const user of users) {
    const nextRole = normalizeRole(user.role);

    if (!CANONICAL_ROLES.has(nextRole)) {
      unresolved.push({ userId: String(user._id), currentRole: user.role });
      continue;
    }

    if (user.role !== nextRole) {
      user.role = nextRole;
      await user.save();
      updated += 1;
    }
  }

  console.log('[role-migration] scanned:', users.length);
  console.log('[role-migration] updated:', updated);
  console.log('[role-migration] unresolved:', unresolved.length);

  if (unresolved.length > 0) {
    console.log('[role-migration] unresolved records:', JSON.stringify(unresolved, null, 2));
  }

  await mongoose.disconnect();
}

migrateRolesToCanonical().catch(async (error) => {
  console.error('[role-migration] failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});