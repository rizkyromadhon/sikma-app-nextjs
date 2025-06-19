import { object, string } from "zod";

export const LoginSchema = object({
  email: string()
    .email("Yuk masukkan email yang valid.")
    .refine((email) => email.endsWith("@gmail.com"), {
      message: "Email harus berakhiran @gmail.com ya.",
    }),
  password: string().nonempty("Password wajib diisi ya."),
});

const commonPasswords = ["12345678", "qwertyui"];
export const RegisterSchema = object({
  name: string().min(3, "Nama lengkapnya minimal 3 huruf ya."),
  email: string()
    .email("Yuk masukkan email yang valid.")
    .refine((email) => email.endsWith("@gmail.com"), {
      message: "Email harus berakhiran @gmail.com ya.",
    }),
  password: string()
    .min(8, "Password minimal 8 karakter ya, biar aman.")
    .max(32, "Password maksimal 32 karakter, jangan terlalu panjang ya.")
    .refine((password) => !commonPasswords.includes(password), {
      message: "Password ga boleh menggunakan kata/nomor urut ya, biar aman.",
    }),
  confirmPassword: string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasinya belum sama nih.",
  path: ["confirmPassword"],
});
