# Check-In / Check-Out Report

A small dashboard built with Next.js 14, React, and Tailwind CSS for generating reservation reports from the Xano API.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root and add your API token if you want to override the default token baked into the component:

```
NEXT_PUBLIC_XANO_TOKEN=replace-with-your-token
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Available Scripts

- `npm run dev` – Start the Next.js development server.
- `npm run build` – Build the production bundle.
- `npm run start` – Run the production server locally.
- `npm run lint` – Run ESLint using the Next.js configuration.

## Tech Stack

- [Next.js 14](https://nextjs.org/)
- [React 18](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios](https://axios-http.com)
- [Day.js](https://day.js.org)
- [React Datepicker](https://reactdatepicker.com)

## Notes

- The token defaults to the one used previously. Storing your own token in `.env.local` keeps secrets out of source control.
- Sorting, pagination, searching, and CSV export are all handled on the client and work best for small-to-medium result sets.
