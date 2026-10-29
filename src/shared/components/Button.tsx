import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = "primary",
  isLoading = false,
  children,
  disabled,
  ...rest
}: ButtonProps) => {
  return (
    <button {...rest} disabled={disabled || isLoading} data-variant={variant}>
      {isLoading ? "Loading..." : children}
    </button>
  );
};