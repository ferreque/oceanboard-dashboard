import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const BUCKET = "project-documents";
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type DocumentRow = {
  id: string;
  project_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  uploaded_at: string;
};

const projectIdSchema = z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);

const fileMetaSchema = z.object({
  projectId: projectIdSchema,
  fileName: z.string().min(1).max(200),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
});

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(-120);
}

export const listDocuments = createServerFn({ method: "GET" })
  .inputValidator((input: { projectId: string }) => ({
    projectId: projectIdSchema.parse(input.projectId),
  }))
  .handler(async ({ data }): Promise<DocumentRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("project_documents")
      .select("*")
      .eq("project_id", data.projectId)
      .order("uploaded_at", { ascending: false });
    if (error) throw new Error("No se pudieron cargar los documentos.");
    return rows ?? [];
  });

export const createUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => fileMetaSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `${data.projectId}/${crypto.randomUUID()}-${sanitizeFileName(data.fileName)}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error("No se pudo preparar la subida.");
    return { path, signedUrl: signed.signedUrl, token: signed.token };
  });

export const confirmUpload = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    fileMetaSchema.extend({ path: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<DocumentRow> => {
    if (!data.path.startsWith(`${data.projectId}/`)) throw new Error("Ruta no válida.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const storage = supabaseAdmin.storage.from(BUCKET);

    // Verify the object really exists before registering it.
    const { data: info, error: infoError } = await storage.info(data.path);
    if (infoError || !info) throw new Error("El archivo no se ha subido correctamente.");

    const size = typeof info.size === "number" ? info.size : data.fileSize;
    const mime = info.contentType ?? data.mimeType;
    if (size > MAX_FILE_SIZE || !ALLOWED_MIME_TYPES.includes(mime as never)) {
      await storage.remove([data.path]);
      throw new Error("El archivo no cumple los requisitos de tipo o tamaño.");
    }

    const { data: row, error } = await supabaseAdmin
      .from("project_documents")
      .insert({
        project_id: data.projectId,
        file_name: data.fileName,
        file_size: size,
        mime_type: mime,
        storage_path: data.path,
      })
      .select("*")
      .single();
    if (error || !row) {
      await storage.remove([data.path]);
      throw new Error("No se pudo registrar el documento.");
    }
    return row;
  });

export const getDocumentUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => ({ id: z.string().uuid().parse(input.id) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: doc, error } = await supabaseAdmin
      .from("project_documents")
      .select("storage_path, file_name")
      .eq("id", data.id)
      .single();
    if (error || !doc) throw new Error("Documento no encontrado.");
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(doc.storage_path, 60); // expires in 60 seconds
    if (signError || !signed) throw new Error("No se pudo generar el enlace.");
    return { url: signed.signedUrl };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => ({ id: z.string().uuid().parse(input.id) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: doc, error } = await supabaseAdmin
      .from("project_documents")
      .select("storage_path")
      .eq("id", data.id)
      .single();
    if (error || !doc) throw new Error("Documento no encontrado.");
    const { error: removeError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([doc.storage_path]);
    if (removeError) throw new Error("No se pudo eliminar el archivo.");
    const { error: deleteError } = await supabaseAdmin
      .from("project_documents")
      .delete()
      .eq("id", data.id);
    if (deleteError) throw new Error("No se pudo eliminar el registro.");
    return { ok: true };
  });
