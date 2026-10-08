"use client";

import { useEffect } from "react";

export default function GoogleOneTap() {
  useEffect(() => {
    if (localStorage.getItem("token")) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        console.log("Google Identity Services not loaded");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,

        callback: async (response) => {
          console.log("GOOGLE ONE TAP RESPONSE RECEIVED");

          try {
            const result = await fetch(
              "http://localhost:5000/api/auth/google/one-tap",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  credential: response.credential,
                }),
              }
            );

            const data = await result.json();

            if (!result.ok) {
              throw new Error(
                data.message || "Google login failed"
              );
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem(
              "user",
              JSON.stringify(data.user)
            );

            window.location.href = "/";
          } catch (error) {
            console.error(
              "Google One Tap login failed:",
              error
            );
          }
        },

        auto_select: false,

        cancel_on_tap_outside: false,

        moment_callback: (notification) => {
          console.log(
            "GOOGLE ONE TAP STATUS:",
            notification.getMomentType()
          );

          if (notification.isNotDisplayed()) {
            console.log(
              "GOOGLE ONE TAP NOT DISPLAYED:",
              notification.getNotDisplayedReason()
            );
          }

          if (notification.isSkippedMoment()) {
            console.log(
              "GOOGLE ONE TAP SKIPPED:",
              notification.getSkippedReason()
            );
          }

          if (notification.isDismissedMoment()) {
            console.log(
              "GOOGLE ONE TAP DISMISSED:",
              notification.getDismissedReason()
            );
          }
        },
      });

      console.log("Calling Google One Tap prompt...");

      window.google.accounts.id.prompt();
    };

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;

    document.head.appendChild(script);
  }, []);

  return null;
}