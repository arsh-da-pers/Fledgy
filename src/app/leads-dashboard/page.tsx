"use client";

import { useCallback, useEffect, useState } from "react";

type Lead = {
  email: string;
  source?: string;
  role?: string;
  name?: string;
  expertise?: string;
  tools?: string[];
  firstSeen?: string;
};

const REFRESH_MS = 20000;

function isTest(email: string) {
  return email.startsWith("kv-test") || email.startsWith("reftest-");
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function LeadsDashboard() {
  const [key, setKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("key");
    const saved = window.localStorage.getItem("fledgy_admin_key");
    const k = fromUrl || saved || "";
    if (k) {
      setKey(k);
      window.localStorage.setItem("fledgy_admin_key", k);
    }
  }, []);

  const load = useCallback(async (k: string) => {
    if (!k) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads?key=${encodeURIComponent(k)}`);
      if (res.status === 404) {
        setError("Wrong key — access denied.");
        setLeads(null);
        return;
      }
      const data = await res.json();
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      setUpdatedAt(new Date());
    } catch {
      setError("Could not load leads. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!key) return;
    load(key);
    const id = setInterval(() => load(key), REFRESH_MS);
    return () => clearInterval(id);
  }, [key, load]);

  function submitKey(e: React.FormEvent) {
    e.preventDefault();
    const k = keyInput.trim();
    if (!k) return;
    window.localStorage.setItem("fledgy_admin_key", k);
    setKey(k);
  }

  function signOut() {
    window.localStorage.removeItem("fledgy_admin_key");
    setKey("");
    setKeyInput("");
    setLeads(null);
  }

  // Gate: ask for the key if we don't have one.
  if (!key) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-page px-6 py-16">
        <form
          onSubmit={submitKey}
          className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-ink">
            Fledgy Leads
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Enter your admin key to view signups.
          </p>
          <input
            type="password"
            className="mt-4 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-orange focus:outline-none"
            placeholder="Admin key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-lg bg-brand-orange px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-orange"
          >
            View dashboard
          </button>
        </form>
      </main>
    );
  }

  const all = leads || [];
  const real = all.filter((l) => !isTest(l.email));
  const shown = (showTest ? all : real).slice().sort((a, b) => {
    // Newest first by first-seen date; undated (pre-tracking) rows sink to the
    // bottom. Ties fall back to email for a stable order.
    const ta = a.firstSeen ? Date.parse(a.firstSeen) : NaN;
    const tb = b.firstSeen ? Date.parse(b.firstSeen) : NaN;
    const va = isNaN(ta) ? -Infinity : ta;
    const vb = isNaN(tb) ? -Infinity : tb;
    return vb - va || a.email.localeCompare(b.email);
  });
  const tool = real.filter((l) => l.source === "tool");
  const seekers = real.filter(
    (l) => l.source === "mentors" && l.role === "seeker"
  );
  const experts = real.filter(
    (l) => l.source === "mentors" && l.role === "mentor"
  );

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = real.filter((l) => {
    const t = l.firstSeen ? Date.parse(l.firstSeen) : NaN;
    return !isNaN(t) && t >= weekAgo;
  }).length;

  const tiles = [
    { label: "Total signups", value: real.length },
    { label: "New this week", value: newThisWeek },
    { label: "Tool users", value: tool.length },
    { label: "Mentor waitlist", value: seekers.length },
    { label: "Mentor applicants", value: experts.length },
  ];

  const toolUsage: Record<"essay" | "cv" | "careers", number> = {
    essay: 0,
    cv: 0,
    careers: 0,
  };
  real.forEach((l) =>
    (l.tools || []).forEach((t) => {
      if (t === "essay" || t === "cv" || t === "careers") toolUsage[t]++;
    })
  );
  const toolLabels: Record<"essay" | "cv" | "careers", string> = {
    essay: "Essay",
    cv: "CV",
    careers: "Career",
  };

  return (
    <main className="flex flex-1 flex-col items-center bg-page">
      <div className="w-full max-w-4xl px-5 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              Fledgy Leads
            </h1>
            <p className="mt-1 text-xs text-ink-faint">
              {updatedAt
                ? `Live · updated ${updatedAt.toLocaleTimeString()}${
                    loading ? " · refreshing…" : ""
                  }`
                : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(key)}
              className="rounded-lg border border-brand-orange-tint px-3 py-2 text-sm font-medium text-brand-orange hover:bg-brand-orange-tint"
            >
              Refresh
            </button>
            <a
              href={`/api/leads?key=${encodeURIComponent(key)}&format=csv`}
              className="rounded-lg bg-brand-orange px-3 py-2 text-sm font-semibold text-white hover:bg-brand-orange"
            >
              Export CSV
            </a>
            <button
              onClick={signOut}
              className="rounded-lg border border-line px-3 py-2 text-sm text-ink-muted hover:bg-white"
            >
              Sign out
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!error && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {tiles.map((t) => (
                <div
                  key={t.label}
                  className="rounded-xl border border-line bg-white p-4"
                >
                  <p className="text-3xl font-semibold text-ink">
                    {t.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-ink-muted">
                    {t.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-ink-muted">Tool usage:</span>
              {(["essay", "cv", "careers"] as const).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-line bg-white px-3 py-1 text-ink-muted"
                >
                  {toolLabels[t]}: <b className="text-ink">{toolUsage[t]}</b>
                </span>
              ))}
              <span className="text-ink-faint">(recorded from now on)</span>
            </div>

            <label className="mt-4 flex items-center gap-2 text-xs text-ink-faint">
              <input
                type="checkbox"
                checked={showTest}
                onChange={(e) => setShowTest(e.target.checked)}
              />
              Show test rows
            </label>

            <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Field</th>
                    <th className="px-4 py-3 font-medium">Tools used</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((l) => (
                    <tr
                      key={l.email}
                      className={`border-b border-cream ${
                        isTest(l.email) ? "opacity-40" : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                        {formatDate(l.firstSeen)}
                      </td>
                      <td className="px-4 py-3 text-ink">{l.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            l.source === "mentors"
                              ? "bg-brand-teal-tint text-brand-teal-dark"
                              : "bg-brand-orange-tint text-brand-orange-dark"
                          }`}
                        >
                          {l.source || "tool"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {l.role || "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {l.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {l.expertise || "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {l.tools && l.tools.length
                          ? l.tools
                              .map((t) =>
                                t === "careers"
                                  ? "Career"
                                  : t === "cv"
                                  ? "CV"
                                  : t === "essay"
                                  ? "Essay"
                                  : t
                              )
                              .join(", ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  {shown.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-ink-faint"
                      >
                        No signups yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
