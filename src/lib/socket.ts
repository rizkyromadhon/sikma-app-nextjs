import WebSocket from "ws";

const SOCKET_URL = "ws://localhost:3001";
let socket: WebSocket | null = null;
const messageQueue: string[] = [];

function connect() {
  // Jangan buat koneksi baru jika sudah ada atau sedang mencoba
  if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
    return;
  }

  console.log("API Client: Mencoba terhubung ke server WebSocket di " + SOCKET_URL);
  socket = new WebSocket(SOCKET_URL);

  socket.on("open", () => {
    console.log("✅ API Client: Terhubung ke server WebSocket!");
    // Kirim semua pesan yang tertunda di antrian
    while (messageQueue.length > 0) {
      const msg = messageQueue.shift();
      if (msg) {
        socket?.send(msg);
        console.log("Mengirim pesan dari antrian:", msg);
      }
    }
  });

  socket.on("close", () => {
    console.log("❌ API Client: Terputus dari server WebSocket. Mencoba koneksi ulang dalam 5 detik...");
    socket = null; // Hapus instance lama
    setTimeout(connect, 5000); // Jadwalkan koneksi ulang
  });

  socket.on("error", (err) => {
    console.error("❌ Error pada koneksi WebSocket API Client:", err.message);
    socket?.close(); // Paksa tutup koneksi saat ada error untuk memicu 'close' dan reconnect
  });
}

// Panggil fungsi connect sekali saat aplikasi dimulai
connect();

/**
 * Helper function untuk mengirim pesan ke server WebSocket.
 * Jika koneksi sedang tidak aktif, pesan akan disimpan di antrian.
 * @param message Objek yang akan dikirim.
 */
export const sendMessage = (message: object) => {
  const messageString = JSON.stringify(message);
  console.log("sendMessage called with:", messageString);

  if (socket && socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(messageString);
      console.log("Message sent:", messageString);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  } else {
    console.warn("Socket belum siap. Menambahkan pesan ke antrian.");
    messageQueue.push(messageString);
  }
};
