
type AuthLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

const AuthLayout = ({ children, className }: AuthLayoutProps) => {
  return (
    <>
      <div className={`flex items-center justify-center bg-white dark:bg-black px-4 ${className || ""}`}>
        <div className="w-full max-w-sm space-y-6">{children}</div>
      </div>
    </>
  );
};

export default AuthLayout;
