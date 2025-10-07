import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import UserModel from "./utils/models/User";
import DBconnection from "./utils/config/db";
import bcrypt from "bcryptjs";

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await DBconnection();

        const user = await UserModel.findOne({ email: credentials?.email });
        if (!user) return null;

        const isValidPassword = await bcrypt.compare(
          credentials?.password,
          user.password
        );
        if (!isValidPassword) return null;

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
          profilePic: user.profilePic,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.profilePic = user.profilePic;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.profilePic = token.profilePic;
      }
      return session;
    },
  },
});
