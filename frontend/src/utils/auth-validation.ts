export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  feedback: string[];
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { isValid: false, score: 0, feedback: ["Password is required"] };
  }

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("At least 8 characters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("One uppercase letter");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("One number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("One special character (!@#$%^&*)");
  }

  const isValid = password.length >= 8 && score >= 3;
  return { isValid, score, feedback };
}

export function getEmailDomainProvider(email: string): { name: string; url: string } | null {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1].toLowerCase();
  
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return { name: "Gmail", url: "https://mail.google.com" };
  }
  if (domain === "outlook.com" || domain === "hotmail.com" || domain === "live.com") {
    return { name: "Outlook", url: "https://outlook.live.com" };
  }
  if (domain === "yahoo.com") {
    return { name: "Yahoo Mail", url: "https://mail.yahoo.com" };
  }
  if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
    return { name: "iCloud Mail", url: "https://www.icloud.com/mail" };
  }
  if (domain === "proton.me" || domain === "protonmail.com") {
    return { name: "Proton Mail", url: "https://mail.proton.me" };
  }
  return null;
}
