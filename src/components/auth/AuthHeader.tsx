type Props = {
  header: string;
  desc: string;
};

const AuthHeader = ({ header, desc }: Props) => {
  return (
    <div className="text-center">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{header}</h1>
      <p className="text-sm md:text-base text-gray-500 dark:text-neutral-400 mt-1 tracking-tight">{desc}</p>
    </div>
  );
};

export default AuthHeader;
