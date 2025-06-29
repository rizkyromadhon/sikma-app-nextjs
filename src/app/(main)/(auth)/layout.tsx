type AuthLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

const AuthLayout = ({ children, className }: AuthLayoutProps) => {
  return (
    <>
      <div
        className={`flex items-center justify-center px-4 min-h-[84vh] md:min-h-[92dvh] ${className || ""}`}
      >
        <div className="w-full max-w-md space-y-6">{children}</div>
      </div>
    </>
  );
};

export default AuthLayout;
