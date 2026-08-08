# ESCALADO: De 1 a 5+ Municipios en 2 Meses

## 🎯 Plan de Expansión Rápida

**Objetivo:** Pasar de Pucón piloto a 5 municipios activos en 8-10 semanas.

---

## 📋 CHECKLIST: ONBOARDING DE NUEVO MUNICIPIO (15 MIN)

### 1. Preparación Información (2 min)

Recopilar:
- [ ] Nombre municipio
- [ ] Email admin principal
- [ ] Nombre admin (usar formato: "Admin [Municipio]")
- [ ] Region/región Chile
- [ ] Teléfono contacto
- [ ] Persona de onboarding (staff contacto)

### 2. Crear Municipio en Sistema (3 min)

```bash
# Ejecutar script de onboarding
npx ts-node scripts/onboard-municipio.ts "Nombre Municipio" "email@municipio.cl"
```

Output esperado:
```
🚀 KEVANZA ONBOARDING MUNICIPIO
📍 [Nombre Municipio]
📧 email@municipio.cl

[1/6] Creando municipio...
✅ Municipio creado: [ID]
[2/6] Creando usuario admin...
✅ Admin creado: [ID]
[3/6] Creando usuario demo...
✅ Demo creado: demo@municipio-[ID].test
[4/6] Creando licitación template...
✅ Template creada: [ID]
[5/6] Enviando email de bienvenida...
✅ Email de bienvenida preparado
[6/6] Generando documento de setup...
✅ Documento generado

✅ ONBOARDING EXITOSO
📄 Setup guardado: ./setups/[ID]-setup.md
```

### 3. Configurar Contraseña Temporal (2 min)

El script genera contraseña. Enviar al admin por:
- [ ] Email cifrado
- [ ] WhatsApp Business
- [ ] SMS

### 4. Enviar Documentación (3 min)

Enviar archivos:
- [ ] `docs/ACCESO_PUCON.md` (adaptar para nuevo municipio)
- [ ] `docs/TRAINING_PUCON.md` (copiar tal cual)
- [ ] `setups/[ID]-setup.md` (generado automáticamente)
- [ ] Link a landing page: https://kevanza-mvp.vercel.app

### 5. Primer Login + Setup (3 min)

- [ ] Admin accede: https://kevanza-mvp.vercel.app/auth/login
- [ ] Ingresa credenciales temporales
- [ ] Cambia contraseña (se pide en primer login)
- [ ] Dashboard accesible
- [ ] Ver licitación template

### 6. Capacitación Rápida (2 min)

Enviar:
- [ ] Link a TRAINING_PUCON.md
- [ ] Ofrecimiento de sesión de 30 min via Zoom/Teams
- [ ] FAQ: docs/TRAINING_PUCON.md#preguntas-frecuentes

---

## 📊 TIMELINE: Fase Piloto a Fase Escalado

### SEMANA 1-2: Validación Pucón ✅

| Día | Tarea | Estado |
|-----|-------|--------|
| 1-3 | Operación Pucón (dia a dia) | ✅ |
| 4-5 | Primeras licitaciones reales | ✅ |
| 6-7 | Feedback usuarios + fixes | ✅ |

### SEMANA 3-4: Pre-Scalado

| Día | Municipio | Tarea |
|-----|-----------|-------|
| 15-17 | La Serena | Contacto + demo |
| 18-20 | Valparaíso | Contacto + demo |
| 21-22 | Coquimbo | Contacto + demo |
| 23-24 | Reserva 1 | Contacto + demo |

**Acción:** 4 municipios en conversación

### SEMANA 5-6: Onboarding 1-2

| Día | Acción | Duración |
|-----|--------|----------|
| 25 | Onboard La Serena | 15 min |
| 26 | Capacitación La Serena | 30 min |
| 27-28 | Soporte La Serena | Monitor activo |
| 29 | Onboard Valparaíso | 15 min |
| 30 | Capacitación Valparaíso | 30 min |

**Status:** 2/5 municipios activos

### SEMANA 7-8: Onboarding 3-4

| Día | Acción | Duración |
|-----|--------|----------|
| 31 | Onboard Coquimbo | 15 min |
| 32 | Capacitación Coquimbo | 30 min |
| 33-34 | Soporte Coquimbo | Monitor activo |
| 35 | Onboard Reserva 1 | 15 min |
| 36 | Capacitación Reserva 1 | 30 min |

**Status:** 4/5 municipios activos

### SEMANA 9-10: Estabilización

| Día | Tarea |
|-----|-------|
| 37-40 | Monitoreo de todos | Diario |
| 41-42 | Análisis de métricas | Weekly |
| 43-44 | Ajustes (if needed) | As needed |

**Status:** 5/5 municipios activos, plan de expansión a 10

---

## 💰 ROI ESPERADO (Por Municipio)

### Inversión
- Setup inicial: 1 hora técnica ($150 USD)
- Capacitación: 0.5 horas ($75 USD)
- **Total por municipio:** ~$225 USD

### Beneficio (Anual)
- Reducción de tiempo en licitaciones: 40 horas/año/municipio × $25 = $1,000
- Reducción de errores: ~2 errores/año × $500 = $1,000
- Transparencia = confianza = +2 licitaciones extras: 2 × $500 = $1,000
- **Total por municipio:** ~$3,000 USD/año

### ROI
- **Año 1:** 13× retorno ($225 inversión vs $3,000 beneficio)
- **Año 2+:** +$3,000 beneficio anual

---

## 🔄 PROCESO DE CONTACTO (5 MUNICIPIOS)

### Estrategia de Outreach

**Semana 1: Investigación**
```
Search: "municipios chilenos" + "compras públicas" + "licitaciones"
Target: Municipios medianos (50-150K habitantes)
Criteria: 
  - Activos en compras públicas
  - No usando plataforma actual optimizada
  - Presupuesto disponible
```

**Semana 2: Contacto Inicial**
```
Email template (adaptar):

Asunto: KEVANZA - Transformar Licitaciones en 15 min/municipio

Hola [Alcalde/Director de Compras],

KEVANZA simplifica licitaciones 80% más rápido que métodos manuales.

✅ Crear licitaciones: 10 min (vs 45 min)
✅ Recibir ofertas: Automático
✅ Evaluar: 5 min (vs 2 horas)
✅ Reportes: Generados automáticamente

Municipio piloto (Pucón): Completó primera licitación en 25 min.

¿Interesado en demo de 15 min? (sin costo)

Saludos,
[Your Name]
KEVANZA Team
```

**Semana 3-4: Demostraciones**
- 4 demos de 15 min (online)
- Mostrar: Dashboard, crear licitación, evaluar ofertas, generar reporte
- Comparar con flujo manual
- Cerrar con "¿Cuando empezamos?"

**Semana 5: Negociación**
- Presentar modelo de precios
- Flexible: SaaS mensual OR implementación única
- Incluir: Setup, capacitación, 1 mes soporte

---

## 📦 SCRIPTS DE COPIA-PEGA

### Script 1: Onboarding Rápido
```bash
# Crear 5 municipios de una
for municipio in "La Serena" "Valparaíso" "Coquimbo" "Temuco" "Puerto Montt"; do
  email="${municipio,,}@municipio.cl"
  npx ts-node scripts/onboard-municipio.ts "$municipio" "$email"
  echo "✅ $municipio setup complete"
done
```

### Script 2: Backup Diario
```bash
# Guardar estado de todos los municipios
mkdir -p backups
date=$(date +%Y-%m-%d)
supabase db dump --project-ref [project-id] > "backups/db-$date.sql"
echo "✅ Backup guardado: backups/db-$date.sql"
```

### Script 3: Reporte Mensual
```bash
# Generar reporte de actividad
analytics_report() {
  echo "📊 REPORTE ACTIVIDAD KEVANZA - $(date +%B)"
  echo "---"
  echo "Municipios activos: $(psql -q 'SELECT COUNT(*) FROM municipios WHERE activo=true')"
  echo "Licitaciones creadas: $(psql -q 'SELECT COUNT(*) FROM licitaciones WHERE created_at > NOW() - INTERVAL 30 DAY')"
  echo "Ofertas procesadas: $(psql -q 'SELECT COUNT(*) FROM ofertas WHERE created_at > NOW() - INTERVAL 30 DAY')"
  echo "---"
  echo "Top municipios:"
  psql -q 'SELECT nombre, COUNT(*) as actividad FROM municipios JOIN licitaciones ON municipios.id = licitaciones.municipio_id GROUP BY municipios.id ORDER BY actividad DESC LIMIT 5'
}
analytics_report
```

---

## 📧 TEMPLATES DE EMAIL

### Email 1: Bienvenida (Día 1)
```
Asunto: Bienvenido a KEVANZA - [Municipio]

Hola [Admin Name],

Tu cuenta está lista.

Email: [email]
Contraseña: [temp-pass]
URL: https://kevanza-mvp.vercel.app

Próximos pasos:
1. Login y cambia tu contraseña
2. Lee TRAINING_PUCON.md (30 min)
3. Crea tu primera licitación
4. Invítame para feedback

Preguntas? Contacta: soporte@kevanza.cl

¡Adelante!
```

### Email 2: Check-in (Día 3)
```
Asunto: ¿Cómo va con KEVANZA?

Hola [Admin Name],

¿Ya probaste? Preguntas?

Estoy aquí para ayudar:
- Setup adicional
- Capacitación para tu equipo
- Troubleshooting

Reply a este email.

Saludos,
KEVANZA Team
```

### Email 3: Escalada a Otros (Día 7)
```
Asunto: Invita tu equipo a KEVANZA

Hola [Admin Name],

¿Todo funcionando bien?

Puedes agregar más usuarios:
1. Dashboard > Settings > Usuarios
2. Click "Agregar usuario"
3. Ingresa email del staff

Cada usuario ve solo las licitaciones de tu municipio (seguro).

¿Necesitas más permisos?

Saludos,
KEVANZA Team
```

---

## 🎯 KPI: TRACKING ÉXITO

### Métricas de Adopción

| Métrica | Target | Medición |
|---------|--------|----------|
| Municipios activos (M1) | 1 | Manual |
| Municipios activos (M2) | 2+ | DB query |
| Municipios activos (M3) | 3+ | DB query |
| Licitaciones creadas/mes | 15+ | `SELECT COUNT(*) FROM licitaciones WHERE created_at > NOW() - INTERVAL 30 DAY` |
| Ofertas procesadas/mes | 50+ | `SELECT COUNT(*) FROM ofertas WHERE created_at > NOW() - INTERVAL 30 DAY` |
| Soporte tickets/mes | <5 | Slack/Email log |

### Dashboard de Monitoreo

```sql
-- Top 5 municipios más activos
SELECT 
  m.nombre,
  COUNT(l.id) as licitaciones,
  COUNT(o.id) as ofertas,
  DATE(MAX(l.created_at)) as ultima_actividad
FROM municipios m
LEFT JOIN licitaciones l ON m.id = l.municipio_id
LEFT JOIN ofertas o ON l.id = o.licitacion_id
WHERE m.activo = true
GROUP BY m.id, m.nombre
ORDER BY licitaciones DESC
LIMIT 5;
```

---

## 🚨 TROUBLESHOOTING

### Problema: Admin no recibe email de bienvenida
**Solución:** 
1. Verificar email en `usuarios` table
2. Reenviar manualmente usando template
3. Verificar spam folder en mail admin

### Problema: Lento en provincias
**Solución:**
1. Verificar CDN (Vercel automático)
2. Revisar DB queries en `analytics_events`
3. Optimizar índices si needed

### Problema: Municipio quiere customización
**Solución:**
1. Documentar request en "Feature Requests"
2. Evaluar complejidad (1h? 1d? 1w?)
3. Proponer iteración futura o workaround

---

## 🏁 META: 10+ MUNICIPIOS

Una vez en 5 municipios, expansión a 10:

| Fase | Timeline | Acciones |
|------|----------|----------|
| Estabilización (Ahora) | 2 meses | 5 municipios productivos |
| Escalado (M3-M4) | 2 meses más | 5 municipios nuevos (10 total) |
| Consolidación (M5+) | Ongoing | Crecimiento orgánico, soporte nivel 2 |

---

**Creado:** 2026-08-07  
**Última actualización:** 2026-08-07  
**Versión:** 1.0 - Escalado Plan
