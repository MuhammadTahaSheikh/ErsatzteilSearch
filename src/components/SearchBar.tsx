"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

export function SearchBar({ value, onChange, loading }: SearchBarProps) {
  return (
    <div className="search-glow animate-fade-up relative w-full max-w-2xl rounded-2xl transition-shadow duration-500">
      <div className="surface relative overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
          <svg
            className={`h-5 w-5 transition-colors duration-300 ${value ? "text-accent" : "text-subtle"}`}
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
          className="search-input w-full rounded-2xl bg-transparent py-4 pr-14 pl-14 text-base focus:outline-none"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-5">
            <div className="relative h-6 w-6">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
            </div>
          </div>
        )}
        {!loading && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-muted absolute inset-y-0 right-0 flex items-center pr-5 transition-colors hover:text-heading"
            aria-label="Clear search"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
