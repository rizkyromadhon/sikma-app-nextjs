interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <div className="flex items-center gap-4 p-6 rounded-lg bg-white dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-800 shadow-md">
      <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
