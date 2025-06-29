import prisma from "@/lib/prisma";

export const getTotalStudents = async (prodiId: string) => {
  const count = await prisma.user.count({
    where: {
      role: "MAHASISWA",
      prodiId: prodiId,
    },
  });
  return count;
};

export const getTotalLecturers = async (prodiId: string) => {
  const count = await prisma.user.count({
    where: {
      role: "DOSEN",
      prodiId: prodiId,
    },
  });
  return count;
};

export const getStudentsPerSemester = async (prodiId: string) => {
  const students = await prisma.user.findMany({
    where: {
      role: "MAHASISWA",
      prodiId: prodiId,
    },
    select: {
      id: true,
      nim: true,
      semester: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const counts: { [key: number]: number } = {};
  students.forEach((s) => {
    if (s.semester?.name) {
      const match = s.semester.name.match(/Semester (\d+)/);
      if (match && match[1]) {
        const semesterNum = Number(match[1]);
        if (!isNaN(semesterNum)) {
          counts[semesterNum] = (counts[semesterNum] || 0) + 1;
        }
      } else {
        console.warn(
          `Semester name "${s.semester.name}" for user ${s.semester} did not match "Semester N" format.`
        );
      }
    } else {
      console.warn(`User ${s.id} (NIM: ${s.nim}) has no associated semester.`);
    }
  });

  const result = [];
  for (let i = 1; i <= 8; i++) {
    // Asumsi ada 8 semester yang ingin ditampilkan
    result.push({ semester: i, count: counts[i] || 0 });
  }
  return result;
};

export const getStudentsByProdi = async (prodiId: string, prodiName: string) => {
  const students = await prisma.user.findMany({
    where: {
      role: "MAHASISWA",
      prodiId: prodiId,
    },
    select: {
      gender: true,
    },
  });

  const maleCount = students.filter((s) => s.gender === "LAKI-LAKI").length;
  const femaleCount = students.filter((s) => s.gender === "PEREMPUAN").length;

  return [{ name: prodiName, male: maleCount, female: femaleCount }];
};

export const getAllSemesters = async () => {
  const semesters = await prisma.semester.findMany({
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
      name: true,
      tipe: true,
    },
  });
  return semesters;
};
