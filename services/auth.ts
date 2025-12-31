
import { UserData } from "../types";

export const devAuth = (email: string): UserData | null => {
  const DEV_EMAILS = [
    'digitaldundi@gmail.com',
    'dundichakri@gmail.com',
    'dundichakrikurmapu@gmail.com'
  ];
  
  if (DEV_EMAILS.includes(email.toLowerCase())) {
    return {
      name: 'Lead Developer',
      mobile: '0000000000',
      location: 'Global Hub',
      password: 'dev',
      isDev: true
    };
  }
  
  return null;
};
