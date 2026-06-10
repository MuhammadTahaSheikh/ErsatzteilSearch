# Mini Product Search — Technical Test Task

A spare parts search app built for the [ersatzteilstore24.de](https://ersatzteilstore24.de) developer role. It integrates with the **ASWO EED API** to search products in real time and show detail pages.

## Features

- **Real-time search** — results update as you type (350ms debounce)
- **Product cards** — image, name, price, delivery time, availability
- **Detail view** — click a card for full product info (specs, category path, EAN, etc.)
- **Server-side API proxy** — credentials, session, and IP hashing stay on the server

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- ASWO EED Gateway (`https://shop.euras.com/eed.php`)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

The default `EED_ID` uses the **German test account** from the [EED documentation](https://shop.euras.com/admin/Dok/eed-doku-eng.php) (section 12). The `test` suffix enables the free test environment.

Try these search terms with the test API: `SONY`, `AEG`, `HDMI` (only these work in test mode per EED docs section 12).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Set environment variables:
   - `EED_ID` = `AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZytest`
   - `NEXT_PUBLIC_APP_URL` = your Vercel URL (e.g. `https://your-app.vercel.app`)
   - Do **not** set `EED_USE_MOCK` on Vercel (live API only)
4. **Redeploy** after adding variables (Deployments → ⋯ → Redeploy)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── search/route.ts       # Product search proxy
│   │   ├── products/[id]/route.ts # Product details API
│   │   └── images/[artnr]/route.ts # Image proxy (server-side)
│   ├── product/[id]/page.tsx     # Detail page
│   └── page.tsx                  # Search homepage
├── components/                   # UI components
├── hooks/useProductSearch.ts     # Debounced search hook
└── lib/
    ├── eed.ts                    # EED API client
    ├── session.ts                # Session cookie handling
    └── types.ts                  # TypeScript types
```

## API Integration Notes

Per EED documentation:

- All requests go through server routes (never expose credentials to the browser)
- `sessionid=auto` creates a session on first search; stored in an httpOnly cookie
- `shopurl` and `customerip` (MD5 hash) are sent with every request
- Product images are proxied via `/api/images/[artnr]` where possible

## Submission Checklist

- [ ] Deploy to Vercel (or record a Loom walkthrough)
- [ ] Push code to a public GitHub repo
- [ ] Test search + detail view with terms like `SONY` or `HDMI`
- [ ] Send live link + GitHub URL to Afram on WhatsApp: +41 79 811 94 57

## License

Built as a technical assessment project.
