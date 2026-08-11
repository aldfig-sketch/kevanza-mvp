-- Los registros de auditoría no deben poder falsificarse desde el navegador.
-- Las escrituras pasan por /api/audit y usan service_role.
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_insert ON public.audit_logs;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.audit_logs FROM anon, authenticated;
