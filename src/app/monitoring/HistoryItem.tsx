// components/HistoryItem.tsx
"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useState } from "react";
import { User2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryItem({ item, index }: { item: any; index: number }) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const isSuccess = item.status === "success";
  const badgeClass = cn("text-xs font-bold", {
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300": isSuccess,
    "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300": !isSuccess,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-3 flex justify-between items-center rounded-lg border bg-muted/20 dark:bg-muted/40"
    >
      <div className="flex items-center gap-4 relative">
        {item?.mahasiswa?.foto ? (
          <div className="relative w-12 h-12">
            {isImageLoading && <Skeleton className="absolute inset-0 w-full h-full rounded-full" />}
            <Image
              src={item.mahasiswa.foto}
              alt="Foto Mahasiswa"
              fill
              onLoadingComplete={() => setIsImageLoading(false)}
              className="rounded-full object-cover border-2 border-muted dark:border-neutral-400 shadow"
            />
          </div>
        ) : (
          <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-muted bg-muted/50 text-muted-foreground">
            <User2 className="w-6 h-6" />
          </div>
        )}

        <div>
          <p className="font-medium">{item.mahasiswa.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
      <Badge className={badgeClass}>{isSuccess ? "Sukses" : "Gagal"}</Badge>
    </motion.div>
  );
}
