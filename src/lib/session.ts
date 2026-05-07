import "iron-session";

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
}

import { SessionOptions, getIronSession, IronSessionData } from "iron-session";
import { cookies } from "next/headers";

declare module "iron-session" {
  interface IronSessionData {
    user?: AdminSession;
  }
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "gl_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession() {
  return await getIronSession<IronSessionData>(await cookies(), sessionOptions);
}
