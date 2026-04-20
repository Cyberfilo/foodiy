import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log(`seed: ${count} user(s) already present — skipping.`);
    return;
  }
  console.log('seed: no users yet. First-run setup must be done through /login with ADMIN_SETUP_TOKEN.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
