import { motion } from "framer-motion";
import ThemeToggle from "./ToggleTheme";
import { useTheme } from "next-themes";

type themeType = string | undefined;

const ThemeSwitcher = ({ theme }: { theme: themeType }) => {
  const { setTheme } = useTheme();
  return (
    <div
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={`w-52 h-[36px] mx-auto border border-gray-200 dark:border-gray-800 rounded-full relative overflow-hidden cursor-pointer `}
    >
      <p className="absolute right-1/2 translate-x-1/2 -translate-y-1/2 top-1/2 text-xs text-gray-700 dark:text-gray-300 select-none font-semibold z-8">
        {theme === "light" ? "Light" : "Dark"}
      </p>
      <motion.div
        className="absolute z-10"
        animate={{
          x: theme === "light" ? 3 : 172,
        }}
        initial={false}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        <motion.div
          animate={{
            rotate: theme === "light" ? 0 : 360,
          }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          <ThemeToggle style={`z-20 transition-all ${theme === "light" ? "bg-white" : "bg-black"}`} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThemeSwitcher;
