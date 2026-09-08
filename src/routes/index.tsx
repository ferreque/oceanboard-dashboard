import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  KanbanSquare,
  Users,
  Clock,
  ClipboardList,
  Anchor,
} from "lucide-react";

import { ProjectDocuments } from "@/components/ProjectDocuments";

import {
  proyectos,
  kpis,
  FASES,
  formatFecha,
  type Proyecto,
  type Estado,
} from "@/data/projects";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OceanBoard · Seguimiento de proyectos con clientes" },
      {
        name: "description",
        content:
          "Panel interno de seguimiento de proyectos con clientes: estado, fase, responsables y progreso en un solo lugar.",
      },
      { property: "og:title", content: "OceanBoard · Seguimiento de proyectos" },
      {
        property: "og:description",
        content:
          "Panel interno de seguimiento de proyectos con clientes: estado, fase, responsables y progreso en un solo lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const ESTADO_STYLES: Record<Estado, string> = {
  "En curso": "bg-primary/10 text-primary border-primary/20",
  "En riesgo": "bg-warning/15 text-warning-foreground border-warning/30",
  Completado: "bg-success/15 text-success border-success/30",
};

function EstadoBadge({ estado }: { estado: Estado }) {
  return (
    <Badge variant="outline" className={ESTADO_STYLES[estado]}>
      {estado}
    </Badge>
  );
}

function Progreso({ valor }: { valor: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Progress value={valor} className="h-2 min-w-0 flex-1" />
      <span className="w-9 shrink-0 text-right text-xs font-medium text-muted-foreground">
        {valor}%
      </span>
    </div>
  );
}

const KPI_ITEMS = [
  { icon: KanbanSquare, label: "Proyectos activos", valor: kpis.proyectosActivos },
  { icon: Users, label: "Clientes", valor: kpis.clientes },
  { icon: Clock, label: "Horas este mes", valor: kpis.horasEsteMes },
  { icon: ClipboardList, label: "Entregables pendientes", valor: kpis.entregablesPendientes },
];

function Index() {
  const [busqueda, setBusqueda] = useState("");
  const [fase, setFase] = useState<string>("todas");
  const [seleccionado, setSeleccionado] = useState<Proyecto | null>(null);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return proyectos.filter(
      (p) =>
        (fase === "todas" || p.fase === fase) &&
        (!q || p.cliente.toLowerCase().includes(q)),
    );
  }, [busqueda, fase]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-6 sm:px-6">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Anchor className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              OceanBoard
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              Seguimiento de proyectos con clientes
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {/* KPIs */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPI_ITEMS.map((kpi) => (
            <Card key={kpi.label} className="shadow-none">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <kpi.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none text-foreground">{kpi.valor}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Filtros */}
        <section className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre de cliente…"
              className="pl-9"
            />
          </div>
          <Select value={fase} onValueChange={setFase}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Todas las fases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las fases</SelectItem>
              {FASES.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Tabla (escritorio) */}
        <Card className="hidden shadow-none md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Última actualización</TableHead>
                <TableHead className="w-40">Progreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => setSeleccionado(p)}
                >
                  <TableCell className="font-medium">{p.cliente}</TableCell>
                  <TableCell>{p.proyecto}</TableCell>
                  <TableCell>{p.fase}</TableCell>
                  <TableCell>
                    <EstadoBadge estado={p.estado} />
                  </TableCell>
                  <TableCell>{p.responsable}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatFecha(p.ultimaActualizacion)}
                  </TableCell>
                  <TableCell>
                    <Progreso valor={p.progreso} />
                  </TableCell>
                </TableRow>
              ))}
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No hay proyectos que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Tarjetas (móvil) */}
        <section className="space-y-3 md:hidden">
          {filtrados.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer shadow-none transition-colors hover:bg-accent/40"
              onClick={() => setSeleccionado(p)}
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{p.cliente}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{p.proyecto}</p>
                  </div>
                  <EstadoBadge estado={p.estado} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Fase: <span className="font-medium text-foreground">{p.fase}</span>
                  </span>
                  <span>
                    Responsable: <span className="font-medium text-foreground">{p.responsable}</span>
                  </span>
                  <span>
                    Actualizado:{" "}
                    <span className="font-medium text-foreground">
                      {formatFecha(p.ultimaActualizacion)}
                    </span>
                  </span>
                </div>
                <Progreso valor={p.progreso} />
              </CardContent>
            </Card>
          ))}
          {filtrados.length === 0 && (
            <Card className="shadow-none">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No hay proyectos que coincidan con los filtros.
              </CardContent>
            </Card>
          )}
        </section>
      </main>

      {/* Ficha de proyecto */}
      <Sheet open={!!seleccionado} onOpenChange={(open) => !open && setSeleccionado(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {seleccionado && (
            <>
              <SheetHeader>
                <SheetTitle className="text-lg">{seleccionado.proyecto}</SheetTitle>
                <SheetDescription>{seleccionado.cliente}</SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <EstadoBadge estado={seleccionado.estado} />
                  <Badge variant="secondary">{seleccionado.fase}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Responsable: {seleccionado.responsable}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">Descripción</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {seleccionado.descripcion}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">Progreso</h3>
                  <div className="mt-2">
                    <Progreso valor={seleccionado.progreso} />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Última actualización: {formatFecha(seleccionado.ultimaActualizacion)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">Hitos</h3>
                  <ul className="mt-2 space-y-2.5">
                    {seleccionado.hitos.map((h) => (
                      <li key={h.id} className="flex items-center gap-2.5">
                        <Checkbox id={h.id} checked={h.completado} disabled />
                        <label
                          htmlFor={h.id}
                          className={`text-sm ${h.completado ? "text-muted-foreground line-through" : "text-foreground"}`}
                        >
                          {h.titulo}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">Documentos</h3>
                  <ProjectDocuments projectId={seleccionado.id} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
