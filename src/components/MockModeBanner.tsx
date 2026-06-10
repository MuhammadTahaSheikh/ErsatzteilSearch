"use client";

import { useEffect, useState } from "react";

export function MockModeBanner() {
  const [mock, setMock] = useState(false);

  useEffect(() => {
    fetch("/api/health/eed")
      .then((r) => r.json())
      .then((data) => setMock(Boolean(data.mockMode)))
      .catch(() => {});
  }, []);

  if (!mock) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      Demo mode — EED API unreachable locally. Using sample data. Deploy to Vercel with{" "}
      <code className="rounded bg-amber-100 px-1">EED_USE_MOCK=false</code> for live API.
    </div>
  );
}
