CREATE TABLE public.project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_documents_project_id_idx ON public.project_documents (project_id, uploaded_at DESC);

GRANT SELECT, INSERT, DELETE ON public.project_documents TO authenticated;
GRANT ALL ON public.project_documents TO service_role;

ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read project documents"
ON public.project_documents FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can register allowed documents"
ON public.project_documents FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND file_size > 0 AND file_size <= 10485760
  AND mime_type IN ('application/pdf','image/jpeg','image/png','image/webp')
  AND storage_path LIKE project_id || '/%'
);

CREATE POLICY "Authenticated users can delete project documents"
ON public.project_documents FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL);

-- Storage: private bucket, authenticated-only, restricted to this bucket
CREATE POLICY "Authenticated users can read project-documents files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload project-documents files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete project-documents files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-documents' AND auth.uid() IS NOT NULL);