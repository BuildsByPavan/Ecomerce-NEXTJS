import { SessionProvider } from "next-auth/react";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: {
    template: "%s | Ecom",
    default: "Ecommerce - Platform",
  },
  description: "Full stack Ecommerce Application",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen pt-19 pb-3">{children}</main>
          <Footer />
        </SessionProvider>
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
