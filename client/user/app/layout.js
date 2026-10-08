import "./globals.css";
import NavigationProgress from "../components/navigation-progress";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}