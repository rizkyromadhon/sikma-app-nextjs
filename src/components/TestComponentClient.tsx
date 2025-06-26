"use client";
import { useEffect } from "react";

export default function TestClientComponent() {
  // Log ini HARUS muncul di konsol browser jika komponen ini di-hydrate
  useEffect(() => {
    console.log(">>> TEST CLIENT COMPONENT IS RENDERING AND HYDRATING! <<<");
  }, []);

  return (
    <div
      style={{
        backgroundColor: "lime", // Warna mencolok
        color: "black",
        padding: "10px",
        textAlign: "center",
        fontWeight: "bold",
        position: "fixed", // Agar selalu terlihat
        top: "0",
        left: "0",
        width: "100%",
        zIndex: "9999",
      }}
    >
      TEST CLIENT COMPONENT VISIBLE!
    </div>
  );
}
