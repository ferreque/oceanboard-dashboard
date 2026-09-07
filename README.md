# OceanBoard Dashboard

Build a single-page internal project tracking dashboard called "OceanBoard". All UI text must be in Spanish (Spain). IMPORTANT: Do NOT set up a database, backend, or Lovable Cloud. Use hardcoded mock data in a TypeScript file so the app runs fully client-side. Layout: 1. Header: "OceanBoard" with subtitle "Seguimiento de proyectos con clientes". 2. A row of 4 KPI cards: Proyectos activos, Clientes, Horas este mes, Entregables pendientes. 3. A filter bar: text search by client name, and a dropdown to filter by Fase. 4. A projects table with columns: Cliente, Proyecto, Fase, Estado, Responsable, Última actualización, Progreso. - Fase values: Orientar, Conectar, Ejecutar, Alinear, Nutrir - Estado is a colored badge: En curso / En riesgo / Completado - Progreso is a progress bar with percentage 5. Clicking a table row opens a side sheet with project detail: description, a list of milestones with checkboxes, and a "Documentos" section that for now shows only an empty state placeholder. Seed with 8 realistic mock projects for mid-size Spanish industrial and services companies. Design: clean and professional, light theme, blue/teal accent, generous whitespace. Fully responsive — on mobile the table must collapse into stacked cards, not scroll horizontally. Use shadcn/ui components.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2d1e1db0-f77d-496e-b94a-b84c96ae4d80).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
