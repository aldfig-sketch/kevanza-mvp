-- Create a function to generate and store bases that bypasses RLS

CREATE OR REPLACE FUNCTION public.generar_bases_rpc(
  p_licitacion_id UUID,
  p_tipo_compra TEXT,
  p_contenido_bases JSONB,
  p_estado TEXT DEFAULT 'PROPUESTA'
)
RETURNS public.bases_generadas AS $$
DECLARE
  v_result public.bases_generadas;
BEGIN
  INSERT INTO public.bases_generadas (
    licitacion_id,
    tipo_compra,
    contenido_bases,
    estado,
    fecha_generacion
  ) VALUES (
    p_licitacion_id,
    p_tipo_compra,
    p_contenido_bases,
    p_estado,
    NOW()
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.generar_bases_rpc TO anon, authenticated;
