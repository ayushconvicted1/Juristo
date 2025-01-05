import { MyProvider } from "@/context/MyContext";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";

export const metadata = {
  title: "J U R I S T O",
  description: "Juristo is a legal chatbot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MyProvider>
          {/* <Navbar/> */}
          <ThemeProvider attribute="class">
            <Toaster />
            {children}
          </ThemeProvider>
        </MyProvider>
      </body>
    </html>
  );
}
