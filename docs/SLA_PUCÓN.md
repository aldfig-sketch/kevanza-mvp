# SERVICE LEVEL AGREEMENT (SLA)
## Municipalidad de Pucón - KEVANZA

**Vigencia:** 8 Agosto 2026 - 8 Agosto 2027  
**Versión:** 1.0  
**Status:** VIGENTE

---

## 1. DEFINICIONES

### Disponibilidad (Uptime)

```
Uptime % = (Tiempo Total en Mes - Downtime) / Tiempo Total en Mes × 100%
```

**Ejemplo:**
- Mes: 30 días = 43,200 minutos
- Downtime: 21.6 minutos
- Uptime: (43,200 - 21.6) / 43,200 = 99.95% ✅

### Downtime

Período en que la plataforma está **inaccesible o no funcional** para 50%+ de usuarios.

**NO cuenta como downtime:**
- Mantenimiento programado (máx 1x/mes)
- Problemas del lado del cliente (internet, navegador)
- DDoS o ataque externo
- Fuerza mayor

### Incidente

Evento que causa reducción de funcionalidad. Clasificado por:
- **Crítico (P1):** Sistema 100% caído
- **Alto (P2):** Funcionalidad principal perdida (>50%)
- **Medio (P3):** Funcionalidad parcial afectada (<50%)
- **Bajo (P4):** Cosmético, no afecta operación

---

## 2. DISPONIBILIDAD GARANTIZADA

### Uptime Mensual

| Objetivo | Garantía |
|---|---|
| **Objetivo:** | 99.9% |
| **Garantizado:** | 99.5% |
| **Compensación** | Activada si < 99.5% |

### Traducción a Minutos

```
Uptime Target / Garantizado = Downtime Máximo Permitido

99.5% uptime = máx 21.6 minutos downtime/mes
99.0% uptime = máx 43.2 minutos downtime/mes
95.0% uptime = máx 216 minutos downtime/mes
```

### Histórico Esperado

- **Año 1:** 99.8% promedio (excelente para MVP)
- **Año 2+:** 99.9%+ (objetivo madurez)

---

## 3. RESPUESTA A INCIDENTES

### Time to Response (TTR)

| Severidad | Response | Resolución |
|-----------|----------|-----------|
| **P1 - Crítico** | <30 min | <4 horas |
| **P2 - Alto** | <1 hora | <8 horas |
| **P3 - Medio** | <4 horas | <24 horas |
| **P4 - Bajo** | <24 horas | <72 horas |

### Ejemplo de Clasificación

**P1 (Crítico):** "No puedo acceder a KEVANZA en absoluto"
→ Response <30 min, Resolution <4 horas

**P2 (Alto):** "Puedo logearme pero no puedo crear licitaciones"
→ Response <1 hora, Resolution <8 horas

**P3 (Medio):** "Los reportes PDF tienen error menor en formato"
→ Response <4 horas, Resolution <24 horas

**P4 (Bajo):** "Color del botón no coincide con branding"
→ Response <24 horas, Resolution <72 horas

### Canales de Reporte

1. **Email (Preferido):** soporte@kevanza.cl
2. **Teléfono (P1 only):** +56 9 XXXX XXXX
3. **Formulario web:** https://kevanza-mvp.vercel.app/support (futuro)

---

## 4. COMPENSACIONES (Si falla SLA)

### Tabla de Créditos

Si uptime del mes < 99.5%, Pucón recibe crédito en siguiente factura:

| Uptime | Crédito | Ejemplo |
|--------|---------|---------|
| 99.0% - 99.5% | 5% | $2,500K → $125K descuento |
| 98.0% - 99.0% | 10% | $2,500K → $250K descuento |
| 95.0% - 98.0% | 20% | $2,500K → $500K descuento |
| 90.0% - 95.0% | 30% | $2,500K → $750K descuento |
| < 90.0% | 50% | $2,500K → $1,250K descuento |

### Proceso de Reclamación

1. **Reporte:** Pucón notifica vía email (con evidencia)
2. **Revisión:** KEVANZA valida uptime en logs
3. **Aprobación:** Se confirma crédito en 5 días hábiles
4. **Aplicación:** Crédito se resta de próxima factura

**Plazo máximo:** Reclamo debe hacerse dentro de 60 días de finalizado mes.

---

## 5. MANTENIMIENTO PROGRAMADO

### Ventana de Mantenimiento

- **Día:** Domingo (preferente)
- **Hora:** 2:00 - 6:00 AM (hora Chile, UTC-4)
- **Duración:** Máximo 2 horas
- **Frecuencia:** Máximo 1x/mes

**Por qué domingo 2 AM?** Menor uso (municipios no trabajan fin de semana)

### Notificación

- **Plazo:** Mínimo 72 horas previos
- **Canal:** Email a admin@puconcl.gov.cl
- **Contenido:** Fecha, hora, duración estimada, cambios
- **Estado:** Página https://kevanza-status.com

### No Descontable

Mantenimiento programado **NO se descuenta** del SLA.

Ejemplo:
```
Mes tiene 100% uptime → SLA cumplido ✅
(Aunque haya mantenimiento)
```

---

## 6. BACKUP Y RECUPERACIÓN

### Política de Backup

| Aspecto | Detalle |
|--------|---------|
| **Frecuencia** | Diaria (automática) |
| **Horario** | 3:00 AM UTC (1 AM Chile) |
| **Retención** | 30 días |
| **Ubicación** | Réplica geográfica |
| **Testing** | Mensual (sin conocimiento usuario) |

### Recovery Objectives

- **RPO (Recovery Point Objective):** <24 horas
- **RTO (Recovery Time Objective):** <4 horas

**Traducción:** Si falla BD hoy lunes, recuperamos datos hasta domingo + restaremos en <4 horas.

### Acceso a Backups

- **Exportación manual:** Pucón puede descargar datos en cualquier momento
- **Restauración completa:** KEVANZA ejecuta si es necesario
- **Costo:** Incluido en contrato (hasta 1x/año)

---

## 7. SEGURIDAD FÍSICA Y LÓGICA

### Encriptación

| Nivel | Protocolo | Detalles |
|-------|-----------|----------|
| **En tránsito** | TLS 1.3 | HTTPS, certificado DigiCert |
| **En reposo** | AES-256 | Datos encriptados en BD |
| **En backup** | AES-256 | Backups encriptados |

### Certificaciones

✓ ISO 27001 (Seguridad de Información)  
✓ SOC 2 Type II (auditado anualmente)  
✓ GDPR compliant (aunque aplica LGPD)

### Acceso Administrativo

- **Autenticación:** MFA (multi-factor) obligatorio
- **Auditoría:** Todos los accesos registrados
- **Logs:** Retenidos 90 días
- **Rotación:** Credenciales cada 90 días

---

## 8. CUMPLIMIENTO NORMATIVO

### Leyes Aplicables

| Ley | Aplicación |
|-----|-----------|
| **Ley 19.886** | Compras públicas - KEVANZA cumple requisitos |
| **LGPD (Brasil)** | Protección datos - Supabase certificado |
| **Resolución 1564** | Archivos digitales públicos - Trazabilidad 100% |

### Auditoría

- **Interna:** Mensual (KEVANZA)
- **Externa:** Semestral (auditor independiente)
- **Reporte:** Anual a Pucón (disponible)

### Compliance Officer

**Contacto:** compliance@kevanza.cl  
**Disponible:** Para auditorías municipales, requerimientos legales

---

## 9. MONITOREO CONTINUO

### Dashboard de Status

**URL:** https://kevanza-status.com

**Información disponible:**
- ✓ Uptime en tiempo real
- ✓ Histórico 90 días
- ✓ Incidentes actuales
- ✓ Mantenimiento programado
- ✓ Notificaciones automáticas

### Alertas Automáticas

Pucón puede suscribirse a notificaciones:
- 🟢 Sistema normal
- 🟡 Degradación
- 🔴 Caída (P1)

**Canal:** Email / SMS (configurable)

---

## 10. REPORTES Y ANALYTICS

### Reporte Mensual

Enviado automáticamente (5° día hábil cada mes) a:  
📧 **admin@puconcl.gov.cl**

**Contiene:**
- Uptime % del mes (vs objetivo)
- Incidentes P1-P4 (cantidad, duración)
- Cambios/actualizaciones desplegadas
- Estadísticas de uso (licitaciones, ofertas, reportes)
- Recomendaciones de optimización

### Acceso a Logs

Pucón puede solicitar:
- **Logs de acceso:** Quién entró, cuándo, qué hizo
- **Logs de error:** Qué salió mal y cuándo
- **Logs de auditoría:** Cambios en datos sensibles

**Plazo:** Entregados en 5 días hábiles

---

## 11. EXCEPCIONES Y FUERZAS MAYORES

### NO Cubierto por SLA

El SLA **no aplica** en caso de:

1. **DDoS o ataque externo** (ciberseguridad)
2. **Fuerza mayor** (terremoto, corte de luz, etc.)
3. **Problemas de internet del cliente** (ISP Pucón)
4. **Problema en navegador o computadora** de usuario
5. **Mantenimiento programado** (con aviso previo)

### Comunicación en Crisis

Si ocurre fuerza mayor:
- **Aviso inmediato:** Email + teléfono
- **Updates:** Cada 30 minutos durante incidente
- **Post-mortem:** Reporte en 48 horas
- **Compensación:** Evaluada caso a caso

---

## 12. ESCALACIÓN

### Niveles de Escalación

```
Reporte Inicial
     ↓ (30 min sin respuesta)
Escalación L1 (Soporte técnico senior)
     ↓ (1 hora sin respuesta)
Escalación L2 (Gerencia técnica)
     ↓ (2 horas sin respuesta P1, 4 horas P2)
Escalación L3 (Director ejecutivo)
```

### Contactos de Escalación

| Nivel | Nombre | Email | Teléfono |
|-------|--------|-------|----------|
| L1 | [Técnico senior] | tech-lead@kevanza.cl | +56 9 XXXX XXXX |
| L2 | [Gerente técnico] | manager@kevanza.cl | +56 9 XXXX XXXX |
| L3 | [Director] | director@kevanza.cl | +56 9 XXXX XXXX |

---

## 13. REVISIÓN Y CAMBIOS

### Política de Actualizaciones

- **Revisión anual:** Agosto de cada año
- **Cambios:** Solo con 60 días aviso
- **Mejora:** Siempre a favor del cliente

### Versionado

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-08-08 | Inicial - Pucón |
| 1.1 | TBD | (Futuras mejoras) |

---

## 14. ACEPTACIÓN Y FIRMA

### Pucón Acepta SLA

```
Nombre: ___________________________
Cargo: ____________________________
Firma: ____________________________
Fecha: ____________________________
```

### KEVANZA Acepta SLA

```
Nombre: ___________________________
Cargo: Proveedor de Servicios
Firma: ____________________________
Fecha: ____________________________
```

---

## ANEXO: Glosario Técnico

| Término | Definición |
|---------|-----------|
| **Uptime** | % de tiempo que sistema está disponible |
| **Downtime** | % de tiempo que sistema está caído |
| **SLA** | Acuerdo de nivel de servicio |
| **TTR** | Tiempo hasta respuesta |
| **RTO** | Tiempo máximo para recuperar |
| **RPO** | Máximo datos que se pueden perder |
| **MFA** | Autenticación de múltiples factores |
| **TLS** | Protocolo seguro de transmisión |
| **DDoS** | Ataque de denegación de servicio |

---

**SLA redactado:** 2026-08-08  
**Vigencia:** 2026-08-08 a 2027-08-08  
**Revisión:** Agosto 2027
