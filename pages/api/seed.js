import dbConnect from '../../lib/dbConnect';
import Tenant from '../../models/Tenant';
import User from '../../models/User';
import Note from '../../models/Note';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-seed-secret'] || req.query.secret;
  if (!secret || secret !== process.env.SEED_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  try {
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

    return res.status(200).json({ message: 'Seed complete' });
  } catch (err) {
    console.error('Seed error', err);
    return res.status(500).json({ error: 'Seed failed' });
  }
}
