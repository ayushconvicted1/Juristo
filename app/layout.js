import { MyProvider } from "@/context/MyContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "J U R I S T O",
  description: "Juristo is a legal chatbot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MyProvider>
          <Navbar/>
          <Toaster />
          {children}
        </MyProvider>
      </body>
    </html>
  );
}
