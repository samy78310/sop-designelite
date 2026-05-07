import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { rows } = await sql`
            SELECT * FROM admin_users WHERE email = ${credentials.email as string} LIMIT 1
          `;
          if (!rows[0]) return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            rows[0].password_hash
          );
          if (!valid) return null;

          return {
            id: rows[0].id,
            email: rows[0].email,
            name: rows[0].name,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
