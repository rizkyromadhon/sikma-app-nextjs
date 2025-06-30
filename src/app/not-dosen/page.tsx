import Link from "next/link";

const NotDosenPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black px-4">
      <div className="max-w-md w-full text-center">
        <svg
          className="mx-auto mb-6 h-16 w-16 text-red-400 dark:text-red-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>

        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-200">Akses Ditolak</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-200">
          Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya bisa diakses oleh dosen.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-block px-6 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded hover:bg-gray-800 dark:hover:bg-gray-400 transition-all"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotDosenPage;
