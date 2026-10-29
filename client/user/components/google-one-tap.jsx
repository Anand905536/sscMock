
"use client";

import { useEffect } from "react";
import { apiRequest } from "@/lib/api";

export default function GoogleOneTap() {
    useEffect(() => {
        // Already logged in: don't show One Tap.
        if (localStorage.getItem("token")) {
            return;
        }

        let cancelled = false;
        let script;

        const handleGoogleCredential = async (response) => {
            if (!response?.credential) {
                console.error("Google did not return a credential.");
                return;
            }

            try {

                let data;

                try {
                    data = await apiRequest("/auth/google/one-tap", {
                        method: "POST",
                        body: JSON.stringify({
                            credential: response.credential,
                        }),
                    });
                } catch (error) {
                    console.error(
                        "Google One Tap backend error:",
                        error.message
                    );
                    return;
                }

                localStorage.setItem("token", data.token);
                localStorage.setItem("user",JSON.stringify(data.user));
                window.location.replace("/");
            } catch (error) {
                console.error(
                    "Google One Tap login failed:",
                    error
                );
            }
        };

        const initializeGoogle = () => {
            if (cancelled) return;

            const clientId =
                process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

            if (!clientId) {
                console.error(
                    "NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing. Check client/user/.env.local"
                );
                return;
            }

            if (!window.google?.accounts?.id) {
                console.error(
                    "Google Identity Services script loaded, but Google API is unavailable."
                );
                return;
            }

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleCredential,
                auto_select: false,
                cancel_on_tap_outside: false,
                use_fedcm_for_prompt: true,
            });

            console.log("Google One Tap initialized.");

            window.google.accounts.id.prompt((notification) => {
                console.log(
                    "Google One Tap moment:",
                    notification.getMomentType()
                );

                // These detailed display reasons may not be available
                // when FedCM is enabled.
                if (
                    notification.isNotDisplayed?.() &&
                    notification.getNotDisplayedReason
                ) {
                    console.log(
                        "One Tap not displayed:",
                        notification.getNotDisplayedReason()
                    );
                }

                if (
                    notification.isSkippedMoment?.() &&
                    notification.getSkippedReason
                ) {
                    console.log(
                        "One Tap skipped:",
                        notification.getSkippedReason()
                    );
                }
            });
        };

        // Reuse the script if another component already added it.
        if (window.google?.accounts?.id) {
            initializeGoogle();
        } else {
            script = document.querySelector(
                'script[src="https://accounts.google.com/gsi/client"]'
            );

            if (!script) {
                script = document.createElement("script");
                script.src =
                    "https://accounts.google.com/gsi/client";
                script.async = true;
                script.defer = true;
                script.addEventListener("load", initializeGoogle);
                script.addEventListener("error", handleScriptError);
                document.head.appendChild(script);
            } else {
                script.addEventListener("load", initializeGoogle);
                script.addEventListener("error", handleScriptError);
            }
        }

        function handleScriptError() {
            console.error(
                "Failed to load Google Identity Services script."
            );
        }

        return () => {
            cancelled = true;

            if (script) {
                script.removeEventListener("load", initializeGoogle);
                script.removeEventListener("error", handleScriptError);
            }
        };
    }, []);

    return null;
}
