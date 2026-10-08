"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event) => {
      const link = event.target.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        link.target === "_blank"
      ) {
        return;
      }

      const currentPath = window.location.pathname;

      if (href === currentPath) return;

      setLoading(true);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed left-0 top-0 z-[9999] h-[5px] w-full bg-red-600" />
  );
}