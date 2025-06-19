import { useState } from "react";
import { LuEye, LuEyeClosed } from "react-icons/lu";

type Props = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  error?: string | string[];
};

export const PasswordInput = ({ id, name, label, placeholder, error }: Props) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 dark:text-gray-200">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_5px_#ffffff1a] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 top-1 right-3 flex items-center text-gray-500 dark:text-gray-400 hover:scale-110 focus:outline-none"
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        >
          {show ? <LuEye className="w-5 h-5" /> : <LuEyeClosed className="w-5 h-5" />}
        </button>
      </div>
      {error && Array.isArray(error) ? (
        <ul className="text-sm text-red-500 mt-1 list-disc list-inside space-y-1">
          {error.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      ) : (
        error && <span className="text-sm text-red-500 mt-1 block">{error}</span>
      )}
    </div>
  );
};
