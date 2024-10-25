import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { ThemeProvider } from "./components/theme-provider";
import { useEffect, useState } from "react";
import "./styles/tailwind.css";

function App() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {isHydrated ? (
          <ThemeProvider
            defaultTheme="dark"
            storageKey="roadtrip-theme"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">
                <Outlet />
              </div>
            </div>
          </ThemeProvider>
        ) : (
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">
              <Outlet />
            </div>
          </div>
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default App;