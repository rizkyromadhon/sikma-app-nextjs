import { PrismaClient } from "../src/generated/prisma"; // atau '@prisma/client' jika default

const prisma = new PrismaClient();

async function main() {
  const prodiList = await prisma.programStudi.findMany({ select: { id: true } });
  const semesterList = await prisma.semester.findMany({ select: { id: true } });

  const namaGolongan = ["A", "B", "C", "D"];

  for (const prodi of prodiList) {
    for (const semester of semesterList) {
      for (const name of namaGolongan) {
        await prisma.golongan.upsert({
          where: {
            // gunakan kombinasi unik: prodiId, semesterId, name
            prodiId_semesterId_name: {
              prodiId: prodi.id,
              semesterId: semester.id,
              name,
            },
          },
          update: {},
          create: {
            name,
            prodi: { connect: { id: prodi.id } },
            semester: { connect: { id: semester.id } },
          },
        });
        console.log(`✅ Golongan '${name}' dibuat untuk prodi=${prodi.id}, semester=${semester.id}`);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding golongan:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
