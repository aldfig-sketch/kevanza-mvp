-- KEVANZA: retirar superficie de ofertas
-- KEVANZA gestiona el proceso interno previo a Mercado Público.
-- La recepción de ofertas ocurre exclusivamente en Mercado Público.

DO $$
BEGIN
  IF to_regclass('public.ofertas') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can view ofertas" ON public.ofertas;
    DROP POLICY IF EXISTS "Anyone can insert ofertas" ON public.ofertas;
    DROP POLICY IF EXISTS "Anyone can update ofertas" ON public.ofertas;
    DROP POLICY IF EXISTS "Authenticated users can delete ofertas" ON public.ofertas;

    REVOKE ALL ON TABLE public.ofertas FROM anon;
    REVOKE ALL ON TABLE public.ofertas FROM authenticated;
  END IF;
END $$;

DROP TABLE IF EXISTS public.ofertas CASCADE;
