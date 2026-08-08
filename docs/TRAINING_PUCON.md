# TRAINING: KEVANZA para Municipalidad de Pucón

**Objetivo:** Domina KEVANZA en 30 minutos.  
**Nivel:** Para usuarios sin experiencia técnica.

---

## 1️⃣ CREAR LICITACIÓN (Paso a Paso)

### Acceso
```
1. Login a https://kevanza-mvp.vercel.app
2. Click "+ Nueva Licitación" (botón azul superior)
3. Se abre formulario de 4 pasos
```

### Paso 1: Información General

**Campo: Tipo de Compra**
- Opciones: Equipamiento, Servicios, Infraestructura
- Ej: "Equipamiento"

**Campo: Título**
- Descripción clara de qué compras
- Ej: "Computadores y Laptops 2026"

**Campo: Número**
- Identificador único
- Formato: AÑO-SECUENCIA
- Ej: "2026-001"

**Campo: Presupuesto Total (CLP)**
- Sin límite máximo
- Ej: 45,000,000

**Acción:** Click "Siguiente" ➜

### Paso 2: Presupuesto (Opcional)

- Descripción detallada de qué se compra
- Requisitos técnicos (si hay)
- Click "Siguiente" ➜

### Paso 3: Criterios de Evaluación

**¡IMPORTANTE!** Los porcentajes deben sumar exactamente 100%

| Criterio | % | Explicación |
|----------|---|---|
| **Precio** | 60% | Importancia del costo |
| **Técnica** | 25% | Calidad técnica |
| **Plazo** | 15% | Velocidad de entrega |

**Ejemplo:**
- Precio: 60%
- Técnica: 25%
- Plazo: 15%
- **Total: 100%** ✅

**Acción:** Click "Siguiente" ➜

### Paso 4: Revisar y Publicar

- Revisa todo está correcto
- Dos opciones:
  - **"Guardar como Borrador"** → Editable después
  - **"Publicar Ahora"** → Proveedores ven y pueden ofertar

✅ **Licitación creada exitosamente**

---

## 2️⃣ RECIBIR OFERTAS (Automático)

### Los proveedores hacen:

```
1. Van a https://kevanza-mvp.vercel.app
2. Click "Ofertar"
3. Buscan tu licitación
4. Completan:
   - Nombre empresa
   - Email contacto
   - Precio ofertado (CLP)
   - Plazo en días
   - Descripción técnica
5. Click "Guardar Oferta"
```

### Tú ves:

```
1. Dashboard > tu licitación
2. Click tab "Ofertas"
3. Tabla con todas las ofertas recibidas
4. Datos de cada proveedor
5. Precio y plazo que ofrecen
```

✅ **Las ofertas llegan automáticamente**

---

## 3️⃣ EVALUAR OFERTAS (Lo Importante)

### Paso 1: Acceder Evaluación

```
Dashboard
  ↓
Selecciona licitación
  ↓
Tab "Ofertas"
  ↓
Click "Evaluar" en oferta
```

### Paso 2: Evaluar Criterios

Se abre formulario con **3 sliders**:

#### 1. CRITERIO: PRECIO
- **Rango:** 0 a 100
- **Qué es:** Comparas precios (más bajo = más puntos)
- **Ejemplo:** Si ofrece precio muy bajo → 90 puntos

#### 2. CRITERIO: TÉCNICA
- **Rango:** 0 a 100
- **Qué es:** Evaluás calidad técnica (especificaciones)
- **Ejemplo:** Si cumple bien → 85 puntos

#### 3. CRITERIO: PLAZO
- **Rango:** 0 a 100
- **Qué es:** Velocidad de entrega (plazo ofertado)
- **Ejemplo:** Si es rápido → 75 puntos

### Paso 3: Puntaje Automático

**Sistema calcula automáticamente:**

```
Puntaje Final = 
  (Precio × 60%) +
  (Técnica × 25%) +
  (Plazo × 15%)

Ejemplo:
= (90 × 0.60) + (85 × 0.25) + (75 × 0.15)
= 54 + 21.25 + 11.25
= 86.5 / 100
```

✅ **VES EL PUNTAJE EN VIVO mientras mueves sliders**

### Paso 4: Guardar Evaluación

- Click "Guardar Evaluación"
- Oferta se marca como EVALUADA
- Puntaje se guarda automáticamente

✅ **Ganador = Oferta con puntaje más alto**

---

## 4️⃣ GENERAR REPORTES

### Descargar PDF

```
Dashboard
  ↓
Licitación > Tab "Ofertas"
  ↓
Click botón "📄 Descargar PDF"
  ↓
Archivo descarga a tu computadora
```

**PDF incluye:**
- Datos de la licitación
- Todas las ofertas recibidas
- Evaluación de cada oferta
- Puntajes y ganador
- Fecha de generación
- Firma digital

### Descargar Excel

```
Dashboard
  ↓
Licitación > Tab "Ofertas"
  ↓
Click botón "📊 Descargar Excel"
  ↓
Archivo descarga a tu computadora
```

**Excel incluye:**
- Número oferta
- Empresa proponente
- Precio ofertado (CLP)
- Puntaje total
- Estado

### Usar Reportes

✅ Compartir con equipo evaluador
✅ Presentar a concejo municipal
✅ Archivar para auditoría
✅ Análisis de datos

---

## ❓ PREGUNTAS FRECUENTES

### P: ¿Puedo cambiar el presupuesto después de publicar?
**R:** Solo si está en estado BORRADOR. Después de publicar, NO se puede editar. Debes eliminar y crear nueva.

### P: ¿Cuántas ofertas puedo recibir?
**R:** Sin límite. Sistema escala automáticamente.

### P: ¿Puedo cambiar los criterios después de publicar?
**R:** No. Planifica bien antes de publicar.

### P: ¿Quién puede evaluar?
**R:** Por ahora solo tú (admin). Próximas versiones tendrán evaluadores adicionales.

### P: ¿Los datos se guardan automáticamente?
**R:** Sí. Cada cambio se guarda en la nube automáticamente.

### P: ¿Puedo recuperar licitaciones eliminadas?
**R:** No. Eliminar es permanente. Ten cuidado.

### P: ¿Los reportes son oficiales?
**R:** Sí. Incluyen firma digital y son válidos para auditoría municipal.

---

## 🎯 CHECKLIST: TU PRIMER DÍA

- [ ] Logueaste en la plataforma
- [ ] Creaste tu primera licitación
- [ ] Entiendes los 3 criterios de evaluación
- [ ] Bajaste un reporte en PDF
- [ ] Bajaste un reporte en Excel
- [ ] Probaste con datos de demo

---

## 🚀 ¿Listo para más?

**Siguiente:** Leer [GUIA_USUARIO.md](./GUIA_USUARIO.md) para funcionalidades avanzadas.

---

**Duración:** ~30 minutos  
**Nivel:** Principiante  
**Creado:** 2026-08-08
