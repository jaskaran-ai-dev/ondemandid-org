import { db, schema } from './index';

const seedCustomers = [
  {
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    email: 'john@acme.com',
    countryCode: '+1',
    mobile: '5550100123',
    initialUsers: 25,
    idConnection: 'ACME01',
    status: 'active',
    notes: 'Enterprise customer — priority support',
  },
  {
    companyName: 'Globex Inc',
    contactName: 'Jane Doe',
    email: 'jane@globex.io',
    countryCode: '+44',
    mobile: '7700900123',
    initialUsers: 50,
    idConnection: 'GLBX01',
    status: 'active',
    notes: 'Signed up via partner referral',
  },
  {
    companyName: 'Initech Solutions',
    contactName: 'Bob Johnson',
    email: 'bob@initech.com',
    countryCode: '+1',
    mobile: '5550200456',
    initialUsers: 10,
    status: 'pending',
    notes: 'Awaiting IDCONNECTION provisioning',
  },
  {
    companyName: 'Umbrella Corp',
    contactName: 'Alice Williams',
    email: 'alice@umbrella.co',
    countryCode: '+1',
    mobile: '5550300789',
    initialUsers: 100,
    status: 'inactive',
    notes: 'Trial ended — requested extension',
  },
  {
    companyName: 'Stark Industries',
    contactName: 'Tony Stark',
    email: 'tony@stark.com',
    countryCode: '+1',
    mobile: '5550400111',
    initialUsers: 5,
    idConnection: 'STARK01',
    status: 'active',
    notes: 'Executive team only',
  },
];

const seedRequests = [
  { requestFrom: 'Web portal', status: 'authenticated', ivaltStatusCode: 200 },
  { requestFrom: 'Mobile app', status: 'failed', ivaltStatusCode: 403 },
  { requestFrom: 'Admin panel', status: 'pending', ivaltStatusCode: 422 },
];

async function seed() {
  console.log('Seeding customers...');
  for (const customer of seedCustomers) {
    const [inserted] = await db
      .insert(schema.customers)
      .values(customer)
      .returning();
    console.log(`  ✓ ${inserted.companyName} (${inserted.id})`);

    for (const req of seedRequests) {
      await db.insert(schema.ondemandRequests).values({
        countryCode: customer.countryCode,
        mobile: customer.mobile,
        idConnection: customer.idConnection || 'TEMP01',
        requestFrom: req.requestFrom,
        status: req.status,
        ivaltStatusCode: req.ivaltStatusCode,
      });
    }
  }

  console.log('\nSeed complete.');
  process.exit(0);
}

seed().catch(error => {
  console.error('Seed failed:', error);
  process.exit(1);
});
