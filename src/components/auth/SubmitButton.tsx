"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  text: string;
  type?: "submit" | "reset" | "button";
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  isLoading?: boolean;
  href?: string;
};

export const SubmitButton = ({ text, type, className, icon, onClick, isLoading, href }: Props) => {
  const { pending } = useFormStatus();
  const router = useRouter();
  const [manualLoading, setManualLoading] = useState(false);
  const isSubmitting = isLoading || pending || manualLoading;

  const handleClick = () => {
    if (isSubmitting) return;

    if (href) {
      setManualLoading(true);
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      disabled={isSubmitting}
      onClick={handleClick}
      className={`cursor-pointer ${className} ${isSubmitting ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <div className="relative flex items-center justify-center gap-2">
        {isSubmitting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        )}

        <div className={`flex items-center justify-center gap-2 ${isSubmitting ? "invisible" : "visible"}`}>
          {text}
          {icon}
        </div>
      </div>
    </button>
  );
};
