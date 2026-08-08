# Migraciones SQL para KEVANZA MVP

KEVANZA gestiona requerimientos y bases internas antes de Mercado Publico. No recibe ofertas.

Orden recomendado:

1. `001-retire-ofertas.sql`
2. `002-create-documentos-table.sql`
3. `003-add-bases-fields.sql`
4. `supabase/migrations/20260808183654_pre_publicacion_hardening.sql`

La migracion de hardening:

- Retira tabla/policies/grants de `ofertas`.
- Migra estados post-publicacion a estados internos.
- Aisla `licitaciones` y `documentos` por organismo (`municipio_id` fisico).
- Mantiene el bucket `documentos` privado.
- Exige rutas de storage con prefijo `organismo_id/requerimiento_id/`.
