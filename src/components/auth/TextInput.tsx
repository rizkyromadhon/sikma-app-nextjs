type Props = {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string | string[];
};

export const TextInput = ({ id, name, type = "text", label, placeholder, defaultValue, error }: Props) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-900 dark:text-gray-200">
      {label}
    </label>
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      autoComplete="off"
      className="mt-1 w-full rounded-md border border-gray-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-600 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
    />
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
