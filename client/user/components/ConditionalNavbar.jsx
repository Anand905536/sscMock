"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
    const pathname = usePathname();

    const hideNavbar =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/register" ||
        /^\/tests\/[^/]+$/.test(pathname) ||
        /^\/tests\/[^/]+\/attempt(?:\/|$)/.test(pathname) ||
        /^\/tests\/[^/]+\/result(?:\/|$)/.test(pathname) ||
        /^\/tests\/[^/]+\/analysis(?:\/|$)/.test(pathname)||
        /^\/full-length-exams\/[^/]+\/instructions(?:\/|$)/.test(pathname)||
        /^\/full-length-exams\/[^/]+$/.test(pathname) ||
        /^\/full-length-exams\/result\/[^/]+(?:\/|$)/.test(pathname);

    if (hideNavbar) {
        return null;
    }

    return <Navbar />;
}