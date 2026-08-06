// Fires a best-effort referral credit if this visitor arrived via a ?ref link.
// Call on submit, after the user's email is known. Non-blocking; never throws.
export function fireReferral(email: string) {
  try {
    const ref = window.localStorage.getItem("fledgy_ref");
    if (ref && ref !== email.trim().toLowerCase()) {
      fetch("/api/refer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrer: ref, email }),
      }).catch(() => {});
      // Only credit once per referred visitor.
      window.localStorage.removeItem("fledgy_ref");
    }
  } catch {
    // ignore
  }
}
