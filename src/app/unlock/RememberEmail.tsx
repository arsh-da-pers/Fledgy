"use client";

import { useEffect } from "react";

/**
 * Saves the email Stripe confirmed into localStorage under the same key the
 * tool pages read, so a buyer who paid with one address doesn't land back on
 * /cv or /careers with a different one prefilled and appear unentitled.
 */
export default function RememberEmail({ email }: { email: string }) {
  useEffect(() => {
    try {
      if (email) window.localStorage.setItem("fledgy_email", email);
    } catch {
      // Private mode / storage disabled — harmless, they can retype it.
    }
  }, [email]);

  return null;
}
