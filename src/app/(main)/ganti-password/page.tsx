"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";

export default function GantiPasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const router = useRouter();

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!oldPassword) newErrors.oldPassword = "Password lama wajib diisi.";
    if (!newPassword) newErrors.newPassword = "Password baru wajib diisi.";
    if (!confirmPassword) newErrors.confirmPassword = "Konfirmasi password wajib diisi.";
    if (newPassword && confirmPassword && newPassword !== confirmPassword)
      newErrors.confirmPassword = "Konfirmasi password tidak sama.";

    // Cek jika ada error
    if (Object.values(newErrors).some((v) => v)) {
      setErrors(newErrors);
      return;
    }

    setErrors({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setLoading(true);

    const res = await fetch("/api/mahasiswa/ganti-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
      headers: { "Content-Type": "application/json" },
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Password berhasil diganti.");
      await signIn("credentials", {
        redirect: false,
        email: session?.user?.email,
        password: newPassword,
      });
      router.replace("/?ganti-password=success");
    } else {
      const data = await res.json();
      toast.error(data.message || "Gagal mengganti password.");
      if (data.message === "Password lama salah.") {
        setErrors((prev) => ({ ...prev, oldPassword: data.message }));
      } else {
        toast.error(data.message || "Gagal mengganti password.");
      }
      return;
    }
  };

  return (
    <div className="min-h-[92dvh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-neutral-950 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-center">Ganti Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword" className="mb-2">
                Password Lama
              </Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                className="select-none"
                placeholder="Masukkan Password Lama Anda"
                onChange={(e) => setOldPassword(e.target.value)}
              />
              {errors.oldPassword && <p className="text-sm text-red-500 mt-1">{errors.oldPassword}</p>}
            </div>
            <div>
              <Label htmlFor="newPassword" className="mb-2">
                Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  className="select-none"
                  placeholder="Masukkan Password Baru Anda"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {errors.newPassword && <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>}
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="mb-2">
                Konfirmasi Password Baru
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                placeholder="Masukkan Konfirmasi Password Baru Anda"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
