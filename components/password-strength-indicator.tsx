"use client";

import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  // حساب قوة كلمة المرور
  const getPasswordStrength = (password: string) => {
    let score = 0;

    // طول كلمة المرور
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // تنوع الأحرف
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // تصنيف القوة
    if (score <= 2)
      return { strength: "Weak", color: "bg-red-500", percentage: 25 };
    if (score <= 4)
      return { strength: "Medium", color: "bg-yellow-500", percentage: 50 };
    if (score <= 5)
      return { strength: "Good", color: "bg-blue-500", percentage: 75 };
    return { strength: "Strong", color: "bg-green-500", percentage: 100 };
  };

  const { strength, color, percentage } = getPasswordStrength(password);

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-xs">
        <span>Password Strength: {strength}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
