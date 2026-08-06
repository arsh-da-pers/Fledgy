"use client";

import { useEffect } from "react";

// Captures a ?ref=<email> query param (from a referral link) into localStorage
// so it can be attributed when the visitor later uses a tool. Renders nothing.
export default function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref)) {
        window.localStorage.setItem("fledgy_ref", ref.trim().toLowerCase());
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}
