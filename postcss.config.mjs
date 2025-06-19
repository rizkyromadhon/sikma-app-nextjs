const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Jika Anda masih punya pages
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Tambahkan ini jika Anda menggunakan src/
  ],
  autoprefixer: {},
};
export default config;
