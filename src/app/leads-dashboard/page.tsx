"use client";

import { useCallback, useEffect, useState } from "react";

type Lead = {
  email: string;
  source?: string;
  role?: string;
  name?: string;
  expertise?: string;
};

const REFRESH_MS = 20000;

function isTest(email: string) {
  return email.startsWith("kv-test") || email.startsWith("reftest-");
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
      <main className="flex flex-1 flex-col items-center justify-center bg-[#fdf3e7] px-6 py-16">
        <form
          onSubmit={submitKey}
          className="w-full max-w-sm rounded-2xl border border-[#e7d3bc] bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-[#2a2115]">
            Fledgy Leads
          </h1>
          <p className="mt-1 text-sm text-[#6b5c45]">
            Enter your admin key to view signups.
          </p>
          <input
            type="password"
            className="mt-4 w-full rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-[#e2653b] focus:outline-none"
            placeholder="Admin key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-lg bg-[#e2653b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c8532c]"
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
    // mentors first, then tool users
    const rank = (l: Lead) => (l.source === "mentors" ? 0 : 1);
    return rank(a) - rank(b) || a.email.localeCompare(b.email);
  });
  const tool = real.filter((l) => l.source === "tool");
  const seekers = real.filter(
    (l) => l.source === "mentors" && l.role === "seeker"
  );
  const experts = real.filter(
    (l) => l.source === "mentors" && l.role === "mentor"
  );

  const tiles = [
    { label: "Total signups", value: real.length },
    { label: "Tool users", value: tool.length },
    { label: "Mentor waitlist", value: seekers.length },
    { label: "Mentor applicants", value: experts.length },
  ];

  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#2a2115]">
              Fledgy Leads
            </h1>
            <p className="mt-1 text-xs text-[#9c8b6f]">
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
              className="rounded-lg border border-[#e2a68a] px-3 py-2 text-sm font-medium text-[#c8532c] hover:bg-[#fdf0e8]"
            >
              Refresh
            </button>
            <a
              href={`/api/leads?key=${encodeURIComponent(key)}&format=csv`}
              className="rounded-lg bg-[#e2653b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#c8532c]"
            >
              Export CSV
            </a>
            <button
              onClick={signOut}
              className="rounded-lg border border-[#f0dfc4] px-3 py-2 text-sm text-[#6b5c45] hover:bg-white"
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
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {tiles.map((t) => (
                <div
                  key={t.label}
                  className="rounded-xl border border-[#f0dfc4] bg-white p-4"
                >
                  <p className="text-3xl font-semibold text-[#2a2115]">
                    {t.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#6b5c45]">
                    {t.label}
                  </p>
                </div>
              ))}
            </div>

            <label className="mt-5 flex items-center gap-2 text-xs text-[#9c8b6f]">
              <input
                type="checkbox"
                checked={showTest}
                onChange={(e) => setShowTest(e.target.checked)}
              />
              Show test rows
            </label>

            <div className="mt-3 overflow-x-auto rounded-xl border border-[#f0dfc4] bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#f0dfc4] text-xs uppercase tracking-wide text-[#9c8b6f]">
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Field</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((l) => (
                    <tr
                      key={l.email}
                      className={`border-b border-[#f7ecd9] ${
                        isTest(l.email) ? "opacity-40" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-[#2a2115]">{l.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            l.source === "mentors"
                              ? "bg-[#d7ece7] text-teal-800"
                              : "bg-[#fbe3d8] text-[#b6431f]"
                          }`}
                        >
                          {l.source || "tool"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6b5c45]">
                        {l.role || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#6b5c45]">
                        {l.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#6b5c45]">
                        {l.expertise || "—"}
                      </td>
                    </tr>
                  ))}
                  {shown.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-[#9c8b6f]"
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
