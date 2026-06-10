"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

export function SearchBar({ value, onChange, loading }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <svg
          className="h-5 w-5 text-slate-400"
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
        className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pr-12 pl-12 text-base text-slate-900 shadow-sm transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
        autoFocus
      />
      {loading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
