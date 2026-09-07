export type Fase = "Orientar" | "Conectar" | "Ejecutar" | "Alinear" | "Nutrir";
export type Estado = "En curso" | "En riesgo" | "Completado";

export type Hito = {
  id: string;
  titulo: string;
  completado: boolean;
};

export type Proyecto = {
  id: string;
  cliente: string;
  proyecto: string;
  fase: Fase;
  estado: Estado;
  responsable: string;
  ultimaActualizacion: string;
  progreso: number;
  descripcion: string;
  hitos: Hito[];
};

export const FASES: Fase[] = ["Orientar", "Conectar", "Ejecutar", "Alinear", "Nutrir"];

export const proyectos: Proyecto[] = [
  {
    id: "p-01",
    cliente: "Industrias Maderal, S.L.",
    proyecto: "Digitalización de la planta de Burgos",
    fase: "Ejecutar",
    estado: "En curso",
    responsable: "Marta Ibáñez",
    ultimaActualizacion: "2026-09-04",
    progreso: 62,
    descripcion:
      "Implantación de sensórica y cuadros de mando de producción en las dos líneas de tablero laminado. Incluye formación a los jefes de turno y protocolo de mantenimiento preventivo.",
    hitos: [
      { id: "h1", titulo: "Auditoría de líneas de producción", completado: true },
      { id: "h2", titulo: "Instalación de sensores en línea 1", completado: true },
      { id: "h3", titulo: "Instalación de sensores en línea 2", completado: false },
      { id: "h4", titulo: "Formación a jefes de turno", completado: false },
    ],
  },
  {
    id: "p-02",
    cliente: "Grupo Alvear Logística",
    proyecto: "Rediseño del proceso de última milla",
    fase: "Alinear",
    estado: "En riesgo",
    responsable: "Javier Cortés",
    ultimaActualizacion: "2026-08-28",
    progreso: 45,
    descripcion:
      "Revisión de rutas y turnos en los centros de Valencia y Sagunto para reducir el coste por entrega. Pendiente de validación por parte del comité de dirección.",
    hitos: [
      { id: "h1", titulo: "Mapa de rutas actuales", completado: true },
      { id: "h2", titulo: "Modelo de costes por entrega", completado: true },
      { id: "h3", titulo: "Propuesta de nuevos turnos", completado: false },
      { id: "h4", titulo: "Validación con comité de dirección", completado: false },
    ],
  },
  {
    id: "p-03",
    cliente: "Cerámicas Pinar",
    proyecto: "Plan de eficiencia energética",
    fase: "Orientar",
    estado: "En curso",
    responsable: "Lucía Sanchís",
    ultimaActualizacion: "2026-09-05",
    progreso: 18,
    descripcion:
      "Diagnóstico del consumo de los hornos y definición de un plan de inversión a 24 meses con foco en recuperación de calor residual.",
    hitos: [
      { id: "h1", titulo: "Recogida de consumos históricos", completado: true },
      { id: "h2", titulo: "Visita técnica a los hornos", completado: false },
      { id: "h3", titulo: "Informe de diagnóstico", completado: false },
    ],
  },
  {
    id: "p-04",
    cliente: "Talleres Egaña",
    proyecto: "Certificación ISO 9001",
    fase: "Conectar",
    estado: "En curso",
    responsable: "Marta Ibáñez",
    ultimaActualizacion: "2026-09-01",
    progreso: 34,
    descripcion:
      "Acompañamiento en la preparación documental y de procesos para la auditoría de certificación prevista para el primer trimestre del próximo año.",
    hitos: [
      { id: "h1", titulo: "Análisis de brechas", completado: true },
      { id: "h2", titulo: "Redacción de procedimientos clave", completado: false },
      { id: "h3", titulo: "Auditoría interna de prueba", completado: false },
    ],
  },
  {
    id: "p-05",
    cliente: "Aguas del Segura, S.A.",
    proyecto: "Cuadro de mando de mantenimiento",
    fase: "Ejecutar",
    estado: "En riesgo",
    responsable: "Pablo Ferrer",
    ultimaActualizacion: "2026-08-21",
    progreso: 51,
    descripcion:
      "Unificación de los partes de mantenimiento de las cinco estaciones de bombeo en un único panel de seguimiento semanal.",
    hitos: [
      { id: "h1", titulo: "Inventario de activos críticos", completado: true },
      { id: "h2", titulo: "Definición de indicadores", completado: true },
      { id: "h3", titulo: "Carga de datos históricos", completado: false },
      { id: "h4", titulo: "Puesta en marcha del panel", completado: false },
    ],
  },
  {
    id: "p-06",
    cliente: "Conservas Ribeira",
    proyecto: "Optimización de la cadena de frío",
    fase: "Nutrir",
    estado: "Completado",
    responsable: "Lucía Sanchís",
    ultimaActualizacion: "2026-07-30",
    progreso: 100,
    descripcion:
      "Proyecto cerrado con reducción del 12 % en mermas. Continúa el seguimiento trimestral de indicadores con el equipo de calidad.",
    hitos: [
      { id: "h1", titulo: "Auditoría de cámaras frigoríficas", completado: true },
      { id: "h2", titulo: "Nuevo protocolo de carga", completado: true },
      { id: "h3", titulo: "Informe de cierre", completado: true },
    ],
  },
  {
    id: "p-07",
    cliente: "Montajes Eléctricos Nervión",
    proyecto: "Nuevo modelo de presupuestación",
    fase: "Alinear",
    estado: "En curso",
    responsable: "Javier Cortés",
    ultimaActualizacion: "2026-09-03",
    progreso: 73,
    descripcion:
      "Estandarización de las plantillas de oferta y de los márgenes por tipo de obra, con formación al equipo comercial.",
    hitos: [
      { id: "h1", titulo: "Análisis de ofertas de los últimos 2 años", completado: true },
      { id: "h2", titulo: "Plantilla única de presupuesto", completado: true },
      { id: "h3", titulo: "Formación al equipo comercial", completado: false },
    ],
  },
  {
    id: "p-08",
    cliente: "Servicios Integrales Delta",
    proyecto: "Plan de retención de talento",
    fase: "Conectar",
    estado: "Completado",
    responsable: "Pablo Ferrer",
    ultimaActualizacion: "2026-08-12",
    progreso: 100,
    descripcion:
      "Diseño de itinerarios de carrera y revisión de la política retributiva para los perfiles técnicos de mantenimiento.",
    hitos: [
      { id: "h1", titulo: "Encuesta de clima", completado: true },
      { id: "h2", titulo: "Mapa de itinerarios de carrera", completado: true },
      { id: "h3", titulo: "Presentación a dirección", completado: true },
    ],
  },
];

export const kpis = {
  proyectosActivos: proyectos.filter((p) => p.estado !== "Completado").length,
  clientes: new Set(proyectos.map((p) => p.cliente)).size,
  horasEsteMes: 412,
  entregablesPendientes: proyectos.reduce(
    (acc, p) => acc + p.hitos.filter((h) => !h.completado).length,
    0,
  ),
};

export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
