import "./globals.css";

import ConditionalNavbar from "../components/ConditionalNavbar";
import GoogleOneTap from "@/components/google-one-tap";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleOneTap />
        <ConditionalNavbar />
        {children}
      </body>
    </html>
  );
}