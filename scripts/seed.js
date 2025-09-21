import dbConnect from '../lib/dbConnect.js';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Note from '../models/Note.js';
import bcrypt from 'bcryptjs';

async function seed() {
  await dbConnect();
  await Tenant.deleteMany({});
  await User.deleteMany({});
  await Note.deleteMany({});

  const acme = await Tenant.create({ name: 'Acme', slug: 'acme', subscription: 'free' });
  const globex = await Tenant.create({ name: 'Globex', slug: 'globex', subscription: 'free' });

  const passHash = await bcrypt.hash('password', 8);

  const adminAcme = await User.create({ email: 'admin@acme.test', password: passHash, role: 'admin', tenantId: acme._id });
  const userAcme = await User.create({ email: 'user@acme.test', password: passHash, role: 'member', tenantId: acme._id });
  const adminGlobex = await User.create({ email: 'admin@globex.test', password: passHash, role: 'admin', tenantId: globex._id });
  const userGlobex = await User.create({ email: 'user@globex.test', password: passHash, role: 'member', tenantId: globex._id });

  await Note.create({ content: 'Acme note 1', tenantId: acme._id, owner: adminAcme._id });
  await Note.create({ content: 'Acme note 2', tenantId: acme._id, owner: userAcme._id });
  await Note.create({ content: 'Globex note 1', tenantId: globex._id, owner: adminGlobex._id });

  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
