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
      semesterId: true,
    },
  });

  const counts: { [key: number]: number } = {};
  students.forEach((s) => {
    if (s.semesterId !== null) {
      counts[s.semesterId] = (counts[s.semesterId] || 0) + 1;
    }
  });

  const result = [];
  for (let i = 1; i <= 8; i++) {
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

  const maleCount = students.filter((s) => s.gender === "Laki-laki").length;
  const femaleCount = students.filter((s) => s.gender === "Perempuan").length;

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
