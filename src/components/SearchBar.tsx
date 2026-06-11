"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

export function SearchBar({ value, onChange, loading }: SearchBarProps) {
  return (
    <div className="search-glow relative w-full max-w-2xl rounded-2xl transition-shadow duration-300">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
        <svg
          className="h-5 w-5 text-[var(--muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
          />
        </svg>
      </div>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search spare parts… e.g. SONY, HDMI, AEG"
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 py-4 pr-14 pl-14 text-base text-[var(--foreground)] shadow-[var(--card-shadow)] backdrop-blur-sm transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] focus:outline-none"
      />
      {loading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-5">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      )}
    </div>
  );
}
