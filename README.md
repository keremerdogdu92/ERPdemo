# Qnowa - E-Fatura ve Muhasebe Demo

Production-grade looking MVP demo for a Turkish accounting/e-invoicing app called "Qnowa". This is a demo-only application designed to impress bankers and CPAs (mali müşavir).

## Features

- **Company Setup**: First screen to configure company information and accounting mode (İşletme Defteri or Genel Muhasebe)
- **Role-based UI**: Toggle between "Mükellef" and "Mali Müşavir" roles
- **Invoice Management**: Create, view, and manage sales invoices with full e-invoice state machine
- **Incoming Invoices**: Auto-sync simulation for incoming invoices
- **Payments & Collections**: Manage payments and collections (Kasa, Banka, Çek, Senet)
- **Inventory**: Stock items, movements, expenses, and services
- **Accounting**: Generate accounting vouchers based on company mode
- **Defter Beyan**: Queue management for book declaration submissions
- **Dashboard**: Quick KPIs and overview

## Tech Stack

- **Vite** + **React** + **TypeScript**
- **TailwindCSS** for styling
- **shadcn/ui** components (custom implementation)
- **React Router** for navigation
- **Local-first**: In-memory store + localStorage persistence
- **No backend required** - purely static SPA

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Deployment

This app is designed to be deployed as a static SPA on Vercel (or any static hosting).

### Vercel Deployment

1. Push your code to a Git repository
2. Import the project in Vercel
3. Vercel will automatically detect Vite and configure the build
4. The `vercel.json` file ensures SPA routing works correctly

### Build Configuration

- Build command: `npm run build`
- Output directory: `dist`
- No environment variables required

## Usage

1. **First Launch**: You'll be prompted to enter company information and select accounting mode
2. **Demo Data**: The app comes pre-seeded with realistic demo data
3. **Role Switching**: Go to Settings to switch between Mükellef and Mali Müşavir roles
4. **Reset Demo Data**: Use the "Demo Verilerini Sıfırla" button in Settings to reset

## Project Structure

```
src/
├── components/
│   ├── layout/       # Sidebar, Topbar, Layout
│   └── ui/           # shadcn/ui components
├── lib/
│   ├── storage.ts     # localStorage persistence layer
│   ├── seed.ts       # Demo data seeding
│   └── utils.ts      # Utility functions
├── pages/
│   ├── CompanySetup.tsx
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   ├── DefterBeyan.tsx
│   ├── fatura/       # Invoice pages
│   ├── gelen-fatura/ # Incoming invoice pages
│   ├── odeme-tahsilat/ # Payment pages
│   ├── envanter/     # Inventory pages
│   └── muhasebe/     # Accounting pages
└── types/
    └── index.ts      # TypeScript type definitions
```

## Key Features Explained

### E-Invoice State Machine

Invoices follow a strict state flow:
- Taslak → Gönderildi → Onaylandı → GİB'e İletildi → PDF Oluşturuldu
- Can be cancelled (İptal) or returned (İade)
- Full audit trail (immutable event timeline)

### Auto-Sync Simulation

The "Gelen Faturalar" page simulates automatic synchronization:
- Shows last sync time
- Automatically adds new invoices when entering the page
- Manual sync button available

### Accounting Vouchers

Vouchers are generated differently based on company mode:
- **İşletme Defteri**: Simple income/expense entries
- **Genel Muhasebe**: Double-entry bookkeeping (Borç/Alacak)

### Defter Beyan Queue

Simulates a headless robot processing book declaration jobs:
- Queue management
- Status tracking (pending, processing, success, error)
- Log viewing
- Manual controls for demo purposes

## Notes

- This is a **demo-only** application
- All data is stored in browser localStorage
- No backend or API calls
- All services are mocked
- Turkish UI language only

## License

This is a demo project for demonstration purposes.
