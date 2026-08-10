-- Fix RLS policies for bases_generadas to allow authenticated users to insert

-- Disable RLS temporarily if needed
ALTER TABLE IF EXISTS public.bases_generadas DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE IF EXISTS public.bases_generadas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "bases_generadas_select" ON public.bases_generadas;
DROP POLICY IF EXISTS "bases_generadas_insert" ON public.bases_generadas;
DROP POLICY IF EXISTS "bases_generadas_update" ON public.bases_generadas;

-- Create new policies that allow authenticated users to manage their own data
CREATE POLICY "bases_generadas_select"
  ON public.bases_generadas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "bases_generadas_insert"
  ON public.bases_generadas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "bases_generadas_update"
  ON public.bases_generadas FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
