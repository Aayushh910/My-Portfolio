import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const LOCAL_URI = 'mongodb://127.0.0.1:27017/tododb';
const ATLAS_URI = 'mongodb+srv://taskflow_admin:aayush9106@transitops.fef2geb.mongodb.net/tododb?retryWrites=true&w=majority';

async function migrate() {
  console.log('--- Database Migration to MongoDB Atlas Cloud ---');

  // 1. Connect to Atlas
  console.log('[1/4] Connecting to MongoDB Atlas...');
  let atlasConn;
  try {
    atlasConn = await mongoose.createConnection(ATLAS_URI, {
      serverSelectionTimeoutMS: 15000,
    }).asPromise();
    console.log(` Connected to Atlas: ${atlasConn.host}/${atlasConn.name}`);
  } catch (err) {
    console.error(' Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1);
  }

  // 2. Connect to Local MongoDB
  console.log('[2/4] Connecting to Local MongoDB (127.0.0.1:27017)...');
  let localConn;
  let localAvailable = false;
  try {
    localConn = await mongoose.createConnection(LOCAL_URI, {
      serverSelectionTimeoutMS: 4000,
    }).asPromise();
    console.log(` Connected to Local MongoDB: ${localConn.host}/${localConn.name}`);
    localAvailable = true;
  } catch (err) {
    console.warn(' Local MongoDB not reachable or not running:', err.message);
  }

  // 3. Migrate collections if local DB is running
  if (localAvailable) {
    console.log('[3/4] Migrating collections from Local to Atlas...');
    const collections = await localConn.db.listCollections().toArray();
    console.log(`Found ${collections.length} local collections:`, collections.map(c => c.name));

    for (const col of collections) {
      const colName = col.name;
      if (colName.startsWith('system.')) continue;

      const localCol = localConn.db.collection(colName);
      const atlasCol = atlasConn.db.collection(colName);

      const docs = await localCol.find({}).toArray();
      console.log(` -> Collection "${colName}": ${docs.length} documents found locally.`);

      if (docs.length > 0) {
        // Upsert documents by _id into Atlas
        const bulkOps = docs.map((doc) => ({
          replaceOne: {
            filter: { _id: doc._id },
            replacement: doc,
            upsert: true,
          },
        }));

        const result = await atlasCol.bulkWrite(bulkOps);
        console.log(`    Upserted into Atlas: ${result.upsertedCount} inserted, ${result.modifiedCount} updated.`);
      }
    }
  } else {
    console.log('[3/4] Skipping document copy since local MongoDB is offline.');
  }

  // 4. Ensure admin user exists in Atlas
  console.log('[4/4] Verifying Admin account in Atlas...');
  const atlasUsers = atlasConn.db.collection('users');
  const adminUser = await atlasUsers.findOne({
    $or: [{ username: 'admin' }, { email: 'admin@taskflow.dev' }],
  });

  if (adminUser) {
    console.log(` Admin user already exists in Atlas: username="${adminUser.username}", role="${adminUser.role}".`);
  } else {
    // We will hash password for admin
    const bcrypt = (await import('bcryptjs')).default;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await atlasUsers.insertOne({
      username: 'admin',
      email: 'admin@taskflow.dev',
      password: hashedPassword,
      role: 'Administrator',
      fullName: 'System Administrator',
      bio: 'Default System Administrator for TaskFlow',
      avatar: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(' Created default Admin user in Atlas (username: "admin", password: "admin123").');
  }

  // Show summary of Atlas collections & counts
  console.log('\n--- Atlas Cloud Database Current Status ---');
  const atlasCols = await atlasConn.db.listCollections().toArray();
  for (const c of atlasCols) {
    const count = await atlasConn.db.collection(c.name).countDocuments();
    console.log(`Collection "${c.name}": ${count} document(s)`);
  }

  await atlasConn.close();
  if (localConn) await localConn.close();
  console.log('\n Migration and verification complete!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});

