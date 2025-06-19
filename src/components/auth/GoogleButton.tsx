"use client";

import Image from "next/image";

const GoogleButton = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">atau</span>
        <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
      </div>
      <button
        type="button"
        onClick={() => {
          console.log("Login dengan Google");
        }}
        className="flex items-center justify-center gap-3 w-full border border-gray-300 dark:border-gray-700 py-3 px-4 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-black dark:hover:bg-[#1A1A1A] hover:transition-all hover:bg-slate-100"
      >
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/1002px-Google_Favicon_2025.svg.png"
          alt="Google"
          width={20}
          height={20}
        />
        <span>Masuk dengan Google</span>
      </button>
    </div>
  );
};

export default GoogleButton;
