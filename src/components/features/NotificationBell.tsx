"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";

interface Notifikasi {
  id: string;
  tipe: string;
  konten: string;
  url_tujuan?: string;
  read_at: string | null;
  createdAt: string;
  sender: {
    name: string;
    role: string;
  };
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notifikasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("wss://sikma-websocket-server.onrender.com");
    setWs(socket);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notifikasi" && message.targetUserId === userId) {
        setNotifications((prev) => [message.payload, ...prev]);
      }
    };

    return () => socket.close();
  }, [userId]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications/mahasiswa");
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (error) {
      console.error("Gagal update read_at", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative bg-transparent hover:bg-transparent">
          <Bell className="h-5 w-5 text-neutral-700 dark:text-neutral-300 hover:text-neutral-200 dark:hover:text-neutral-200" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 text-[10px] px-1 py-[1px] rounded-full bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-70 mr-12 md:mr-0 md:w-80 p-3">
        <h4 className="font-semibold mb-2 text-sm">Notifikasi</h4>
        <ScrollArea className="h-64 pr-1">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">Tidak ada notifikasi</p>
          ) : (
            notifications.map((notif) => (
              <Link
                key={notif.id}
                href={notif.url_tujuan || "#"}
                className="block px-3 py-2 mb-1 rounded-md hover:bg-muted transition-all"
                onClick={() => markAsRead(notif.id)}
              >
                <div className="text-sm font-medium">
                  {notif.konten}
                  <div>{!notif.read_at && <span className="text-[10px] text-red-500">• Baru</span>}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Dari: {notif.sender.name} ({notif.sender.role}) -{" "}
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </Link>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
