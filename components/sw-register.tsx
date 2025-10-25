"use client";
import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Delay registration until page load so Next head tags are applied
      const onLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("SW registered:", reg.scope);
          })
          .catch((err) => console.error("SW registration failed:", err));
      };
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad, { once: true });
    }
  }, []);

  return null;
}