# GO-LIVE CHECKLIST - MUNICIPALIDAD DE PUCÓN
## KEVANZA v1.0 MVP

**Go-Live Date:** 8 Agosto 2026  
**Status:** 🟢 READY FOR LAUNCH  
**Coordinador:** [Tu nombre]  
**Contacto Pucón:** admin@puconcl.gov.cl

---

## 📋 PRE-LAUNCH VERIFICATION (48 horas antes)

### Infraestructura
- [x] Servidor Supabase verificado (São Paulo)
- [x] Vercel deployment activo
- [x] DNS resolviendo correctamente
- [x] SSL certificado válido (DigiCert)
- [x] Backups automáticos configurados
- [x] Monitoring y alertas activas
- [x] Firewall y seguridad OK
- [x] Load balancing testeado

### Aplicación
- [x] Build sin errores TypeScript
- [x] 13 rutas compiladas exitosamente
- [x] Todas las páginas respondiendo (200 OK)
- [x] Formas funcionando correctamente
- [x] Reportes PDF/Excel generando
- [x] Dashboard con datos reales
- [x] Mobile responsive testeado
- [x] Performance: <2s load time

### Bases de Datos
- [x] Schema PostgreSQL correcto
- [x] RLS (Row Level Security) configurada
- [x] Índices en tablas principales
- [x] Datos de prueba cargados
- [x] Backup de seguridad hecho
- [x] Connections limit OK
- [x] Query performance OK

### Integraciones
- [x] Email service ready (logging OK)
- [x] Analytics tracking OK
- [x] Error logging OK
- [x] API endpoints respondiendo

### Documentación
- [x] CONTRATO_PUCÓN.md finalizado
- [x] PRICING_MODEL.md actualizado
- [x] SLA_PUCÓN.md formal
- [x] TRAINING_PUCON.md revisado
- [x] ACCESO_PUCON.md actualizado
- [x] FAQ documentadas

### Equipo
- [x] Yo disponible 24/7 (por primera semana)
- [x] Backup técnico identificado
- [x] Escalación clara (L1→L2→L3)
- [x] Números de emergencia compartidos

---

## 🚀 LAUNCH DAY TIMELINE (8 Agosto 2026)

### MORNING: PRE-LAUNCH (8:00 - 10:00)

#### 08:00 - Verifica Sistema
- [ ] Login a https://kevanza-mvp.vercel.app
- [ ] Dashboard carga correctamente
- [ ] BD responde
- [ ] Crear licitación TEST
- [ ] Generar reporte TEST
- [ ] Logs limpios (sin errores)

**Contacto:** Espera a Pucón

#### 09:00 - Envía Email de Bienvenida
```
Asunto: KEVANZA ACTIVO - Municipalidad de Pucón

Hola [Admin Pucón],

¡KEVANZA ya está 100% operativo para Pucón!

📍 ACCESO:
URL: https://kevanza-mvp.vercel.app
Email: admin@puconcl.gov.cl
Contraseña: [Temporal - Cambiar en primer login]

✅ QUÉ ESTÁ LISTO:
- Crear licitaciones (sin límite)
- Recibir ofertas (automático)
- Evaluar ofertas (3 criterios)
- Generar reportes PDF/Excel
- Dashboard con analytics

📚 DOCUMENTACIÓN:
- Guía rápida: TRAINING_PUCON.md
- SLA garantizado: SLA_PUCÓN.md
- Preguntas: ACCESO_PUCON.md

💬 SOPORTE:
Email: soporte@kevanza.cl
Teléfono: +56 9 XXXX XXXX
Disponible: Lunes-Viernes 9:00-18:00

Próximo paso: Hacer login y cambiar contraseña.

¡Adelante!
```

- [ ] Email enviado a admin@puconcl.gov.cl
- [ ] Email copiado a archivo
- [ ] Timestamp registrado

#### 09:30 - Verifica Recepción
- [ ] ¿Pucón recibió email?
- [ ] ¿Logró loguearse?
- [ ] ¿Cambió contraseña?

**Si hay problema:** Llamar inmediatamente

### AFTERNOON: LAUNCH CALL (14:00 - 14:30)

#### 14:00 - Llamada con Admin Pucón

**Agenda (30 minutos):**

1. **Intro (5 min)**
   ```
   "¡Hola! Soy [Tu nombre] del equipo KEVANZA.
   Hoy lanzamos tu plataforma.
   Vamos a hacer un tour rápido."
   ```

2. **Tour Plataforma (15 min)**
   - Mostrar dashboard (widgets)
   - Crear licitación test paso a paso
   - Explicar criterios ponderados
   - Mostrar cómo reciben ofertas
   - Generar reporte PDF en vivo
   - Explicar analytics

3. **Q&A (5 min)**
   ```
   "¿Preguntas o dudas sobre lo que viste?"
   ```

4. **Próximos Pasos (5 min)**
   ```
   "Ahora vay a:
   1. Leer TRAINING_PUCON.md (30 min)
   2. Crear primera licitación REAL
   3. Yo estoy acá para ayudar"
   ```

- [ ] Llamada completada
- [ ] Notas guardadas
- [ ] Contacto de emergencia Pucón confirmado

#### 14:30 - Post-Call Check
- [ ] Pucón entendió funcionalidades?
- [ ] Pucón creó licitación test?
- [ ] Problemas reportados?
- [ ] Próximo contacto programado?

### END OF DAY (17:00 - 18:00)

#### 17:00 - Verifica Actividad
```sql
-- Ejecutar en BD
SELECT COUNT(*) FROM licitaciones 
WHERE municipio_id = 'PUCON' 
AND created_at >= NOW() - INTERVAL 1 DAY;

-- Expected: 1+ licitaciones
```

- [ ] ¿Pucón creó licitaciones?
- [ ] Analytics mostrando eventos?
- [ ] Sistema estable?

#### 18:00 - Cierre Día 1
- [ ] Resumen de Go-Live:
  - Qué salió bien
  - Qué necesita ajuste
  - Feedback de Pucón
- [ ] Guardar en archivo
- [ ] Confirmar a Pucón: "Go-live exitoso"

---

## 📊 SEMANA 1: MONITOREO INTENSIVO

### Daily (Lunes-Viernes)

#### 9:00 AM - Check Diario
```
- ¿Sistema up? (Uptime check)
- ¿Pucón activo? (Analytics query)
- ¿Errores en logs? (Error review)
- ¿Respuesta rápida? (Performance check)
```

#### Checklist Diario
- [ ] Uptime 99%+ ✅
- [ ] 0 errores críticos ✅
- [ ] Pucón en uso ✅
- [ ] Email support respondido <4h ✅

### Weekly (Viernes 15:00)

#### Call de Status (30 min)
```
Temas:
1. ¿Cómo va con KEVANZA?
2. ¿Qué está usando más?
3. ¿Qué falta?
4. ¿Dudas?
```

- [ ] Call Viernes confirmado
- [ ] Notas guardadas
- [ ] Feedback documentado

---

## 🎯 SEMANA 2: VALIDACIÓN DE ÉXITO

### Métricas a Validar

#### Uptime
- [ ] 99%+ durante semana 1
- [ ] 0 downtime no planeado
- [ ] Mantenimiento: 0 (no necesario)

**Query:**
```sql
SELECT 
  ROUND(100.0 * 
    (EXTRACT(EPOCH FROM (NOW() - INTERVAL 7 DAY)) - 
     (SELECT SUM(EXTRACT(EPOCH FROM (end_time - start_time)))
      FROM incidents 
      WHERE start_time >= NOW() - INTERVAL 7 DAY)) /
    EXTRACT(EPOCH FROM INTERVAL 7 DAY), 2) AS uptime_percent;
```

#### Uso de Plataforma
- [ ] Licitaciones creadas: 1+
- [ ] Ofertas recibidas: 0+ (expected)
- [ ] Reportes generados: 1+
- [ ] Usuarios activos: 2+

**Query:**
```sql
SELECT 
  (SELECT COUNT(*) FROM licitaciones 
   WHERE municipio_id = 'PUCON' 
   AND created_at >= NOW() - INTERVAL 7 DAY) AS licitaciones,
  (SELECT COUNT(*) FROM ofertas 
   WHERE licitacion_id IN (
     SELECT id FROM licitaciones 
     WHERE municipio_id = 'PUCON') 
   AND created_at >= NOW() - INTERVAL 7 DAY) AS ofertas,
  (SELECT COUNT(*) FROM analytics_events 
   WHERE municipio_id = 'PUCON' 
   AND created_at >= NOW() - INTERVAL 7 DAY) AS eventos;
```

#### Satisfacción
- [ ] ¿Pucón satisfecho?
- [ ] NPS >= 7? (1-10)
- [ ] Bugs encontrados? (Track en Trello)
- [ ] Feature requests? (Log para v1.1)

### Success Criteria (Go-Live ✅)

Considera "Go-Live Exitoso" si:

```
✅ 99%+ Uptime (Semana 1)
✅ 0 Bugs Críticos
✅ Pucón creó 2+ licitaciones
✅ Pucón recibió offers reales (si aplica)
✅ Pucón generó reportes
✅ NPS >= 7
✅ Sin problemas de seguridad
```

- [ ] Todas las condiciones ✅ = GO-LIVE EXITOSO

---

## 🐛 TROUBLESHOOTING (Si Fallan Cosas)

### Problema: Admin no recibe email

**Solución:**
1. Verificar email en DB:
   ```sql
   SELECT * FROM usuarios WHERE email = 'admin@puconcl.gov.cl';
   ```
2. Si existe, verificar email service:
   ```
   - Logs: /var/log/emails.log
   - Test: Enviar email test manual
   ```
3. Si falla, verificar:
   - DNS MX records
   - SMTP credentials
   - Spam folder en mail Pucón

**Escalación:** Si >30 min sin resolver → Llamar L2

---

### Problema: Login lento o timeout

**Solución:**
1. Verificar uptime: https://kevanza-status.com
2. Verificar BD conexiones:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   -- If > 100: Problema de conexiones
   ```
3. Verificar Vercel logs:
   - Ir a Vercel Dashboard
   - Ver Deploy logs
   - Buscar errores

**Escalación:** Si>5 min lento → Investigar performance

---

### Problema: Licitación no se guarda

**Solución:**
1. Verificar RLS:
   ```sql
   SELECT * FROM licitaciones 
   WHERE municipio_id = 'PUCON' 
   LIMIT 5;
   ```
2. Si vacío, verificar policy RLS:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'licitaciones';
   ```
3. Si falla, revertir cambio reciente o activar policy

**Escalación:** Si >10 min → Rollback a versión anterior

---

## 📞 CONTACTOS DE EMERGENCIA

### KEVANZA Team

| Rol | Nombre | Email | Teléfono | Disponibilidad |
|---|---|---|---|---|
| **Soporte L1** | [Tu nombre] | soporte@kevanza.cl | +56 9 XXXX XXXX | 24/7 Semana 1 |
| **Tech Lead L2** | [Técnico] | tech@kevanza.cl | +56 9 XXXX XXXX | 9:00-22:00 |
| **Director L3** | [Director] | director@kevanza.cl | +56 9 XXXX XXXX | En caso de crisis |

### Pucón Contact

| Rol | Nombre | Email | Teléfono |
|---|---|---|---|
| **Admin Principal** | [Nombre] | admin@puconcl.gov.cl | [Teléfono] |
| **Contact Alterno** | [Nombre] | [Email] | [Teléfono] |

---

## ✅ POST-LAUNCH (Semana 2)

### Day 14 (22 Agosto)

- [ ] Reporte completo Semana 1-2 generado
- [ ] Todas métricas en verde ✅
- [ ] Feedback de Pucón positivo
- [ ] Plan de Semana 3 confirmado

### Signature de Aceptación

```
Go-Live completado exitosamente.
Municipalidad de Pucón acepta plataforma KEVANZA en PRODUCCIÓN.

Firma Pucón: _____________________
Firma KEVANZA: _____________________
Fecha: ___________________________
```

---

## 📈 SIGUIENTE HITO

**Municipio #2 Onboarding:** 30 Agosto 2026

- Usar template de este checklist
- Replicar exactamente lo mismo
- Mejorar tiempos y procesos
- Target: 5 municipios antes de fin de año

---

**Checklist creado:** 2026-08-08  
**Versión:** 1.0 - Pucón  
**Status:** LISTO PARA EJECUTAR ✅
