import { useCallback, useId, useRef, useState, type DragEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  UploadCloud,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  listDocuments,
  createUploadUrl,
  confirmUpload,
  getDocumentUrl,
  deleteDocument,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  type DocumentRow,
} from "@/lib/documents.functions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ALLOWED_EXT = /\.(pdf|jpe?g|png|webp)$/i;

type UploadItem = {
  key: string;
  name: string;
  progress: number;
  status: "subiendo" | "registrando" | "error";
  error?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function formatFechaHora(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFechaCompacta(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function validateFile(file: File): string | null {
  const mimeOk = (ALLOWED_MIME_TYPES as readonly string[]).includes(file.type);
  if (!mimeOk || !ALLOWED_EXT.test(file.name)) {
    return "Formato no admitido. Solo se aceptan PDF, JPG, PNG y WebP.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `El archivo supera el límite de 10 MB (${formatBytes(file.size)}).`;
  }
  if (file.size === 0) return "El archivo está vacío.";
  return null;
}

function uploadWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error("Error al subir el archivo."));
    xhr.onerror = () => reject(new Error("Error de red al subir el archivo."));
    xhr.send(file);
  });
}

export function ProjectDocuments({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const list = useServerFn(listDocuments);
  const createUrl = useServerFn(createUploadUrl);
  const confirmFn = useServerFn(confirmUpload);
  const getUrl = useServerFn(getDocumentUrl);
  const remove = useServerFn(deleteDocument);

  const queryKey = ["documents", projectId];
  const { data: docs = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => list({ data: { projectId } }),
  });

  const patchUpload = (key: string, patch: Partial<UploadItem>) =>
    setUploads((prev) => prev.map((u) => (u.key === key ? { ...u, ...patch } : u)));

  const uploadOne = async (file: File) => {
    const key = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
    const invalid = validateFile(file);
    if (invalid) {
      toast.error(`${file.name}: ${invalid}`);
      return;
    }
    setUploads((prev) => [...prev, { key, name: file.name, progress: 0, status: "subiendo" }]);
    const meta = {
      projectId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type as (typeof ALLOWED_MIME_TYPES)[number],
    };
    try {
      const { path, signedUrl } = await createUrl({ data: meta });
      await uploadWithProgress(signedUrl, file, (p) => patchUpload(key, { progress: p }));
      patchUpload(key, { status: "registrando", progress: 100 });
      const row = await confirmFn({ data: { ...meta, path } });
      queryClient.setQueryData<DocumentRow[]>(queryKey, (old = []) => [row, ...old]);
      setUploads((prev) => prev.filter((u) => u.key !== key));
      toast.success(`«${file.name}» subido correctamente.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo subir el archivo.";
      patchUpload(key, { status: "error", error: msg });
    }
  };

  const handleFiles = useCallback(
    (files: FileList | File[] | null) => {
      if (!files) return;
      Array.from(files).forEach((f) => void uploadOne(f));
      if (inputRef.current) inputRef.current.value = "";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId],
  );

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!dragging) setDragging(true);
  };
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragging(false);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const openDoc = useMutation({
    mutationFn: (id: string) => getUrl({ data: { id } }),
    onSuccess: ({ url }) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: () => toast.error("No se pudo abrir el documento."),
  });

  const deleteDoc = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: (_, id) => {
      queryClient.setQueryData<DocumentRow[]>(queryKey, (old = []) =>
        old.filter((d) => d.id !== id),
      );
      toast.success("Documento eliminado.");
    },
    onError: () => toast.error("No se pudo eliminar el documento."),
  });

  return (
    <div className="mt-2 space-y-4">
      {/* Zona de subida: arrastrar y soltar en escritorio, tocar en móvil */}
      <label
        htmlFor={inputId}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/10 ring-2 ring-primary/30"
            : "border-border hover:border-primary/50 hover:bg-accent/40",
        )}
      >
        <UploadCloud
          className={cn("size-8", dragging ? "text-primary" : "text-muted-foreground/60")}
        />
        <p className="text-sm font-medium text-foreground">
          {dragging ? "Suelta los archivos aquí" : "Arrastra archivos o toca para seleccionar"}
        </p>
        <p className="text-xs text-muted-foreground">PDF, JPG, PNG o WebP · máx. 10 MB por archivo</p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="application/pdf,image/*"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {/* Subidas en curso */}
      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((u) => (
            <li key={u.key} className="rounded-md border bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-foreground">{u.name}</span>
                {u.status === "error" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setUploads((p) => p.filter((x) => x.key !== u.key))}
                  >
                    Cerrar
                  </Button>
                ) : (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {u.status === "registrando" ? "Guardando…" : `${u.progress}%`}
                  </span>
                )}
              </div>
              {u.status === "error" ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="size-3.5 shrink-0" /> {u.error}
                </p>
              ) : (
                <Progress value={u.progress} className="mt-2 h-1.5" />
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Lista de documentos */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando documentos…
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-lg bg-muted/40 px-4 py-6 text-center">
          <FileText className="size-6 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">Aún no hay documentos</p>
          <p className="text-xs text-muted-foreground">
            Los archivos que subas aparecerán aquí.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {docs.map((d) => {
            const Icon = d.mime_type === "application/pdf" ? FileText : ImageIcon;
            return (
              <li key={d.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 break-all text-sm font-medium text-foreground sm:truncate sm:leading-normal">
                      {d.file_name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatBytes(d.file_size)} · {formatFechaCompacta(d.uploaded_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 sm:h-8 sm:w-8"
                    aria-label={`Abrir ${d.file_name}`}
                    disabled={openDoc.isPending && openDoc.variables === d.id}
                    onClick={() => openDoc.mutate(d.id)}
                  >
                    {openDoc.isPending && openDoc.variables === d.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-destructive hover:text-destructive sm:h-8 sm:w-8"
                    aria-label={`Eliminar ${d.file_name}`}
                    disabled={deleteDoc.isPending && deleteDoc.variables === d.id}
                    onClick={() => {
                      if (window.confirm(`¿Eliminar «${d.file_name}»? Esta acción no se puede deshacer.`)) {
                        deleteDoc.mutate(d.id);
                      }
                    }}
                  >
                    {deleteDoc.isPending && deleteDoc.variables === d.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
