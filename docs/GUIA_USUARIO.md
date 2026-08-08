# KEVANZA - Guía de Usuario

## 1. Introducción

**KEVANZA** es una plataforma moderna para gestionar licitaciones públicas en municipios chilenos. Permite crear, publicar, evaluar ofertas y generar reportes de forma simple y segura.

### Características Principales
- 📋 Crear licitaciones con presupuesto y criterios de evaluación
- 📤 Recibir ofertas de proveedores
- 🎯 Evaluar ofertas con sistema de puntaje automático
- 📊 Generar reportes en PDF y Excel
- 📱 Acceso desde cualquier dispositivo
- 🔒 Seguro con autenticación por email

---

## 2. Comenzar

### Acceso

1. Ir a: **https://kevanza-mvp.vercel.app**
2. Si es primera vez, click **"Registrarse"**
3. Ingresar email y contraseña
4. Click **"Crear cuenta"**

### Login

1. Ingresar email
2. Ingresar contraseña
3. Click **"Iniciar sesión"**
4. Serás redirigido al Dashboard

---

## 3. Dashboard

El dashboard muestra:
- **Total de Licitaciones**: Cantidad total creadas
- **Borradores**: Licitaciones sin publicar (editables)
- **Publicadas**: Licitaciones activas recibiendo ofertas
- **En Evaluación**: Ofertas siendo evaluadas
- **Adjudicadas**: Proceso finalizado

### Gráficos
- **Línea**: Tendencia de licitaciones por mes
- **Donut**: Distribución por estado
- **Barras**: Cantidad por tipo (Equipamiento, Servicios, etc)

---

## 4. Crear Licitación

### Paso 1: Datos Básicos
1. Click **"+ Nueva licitación"**
2. Ingresar **Número** (ej: LIC-2026-001)
3. Ingresar **Título** descriptivo
4. Seleccionar **Tipo** (Equipamiento, Servicios, Infraestructura)
5. Seleccionar **Municipio**
6. Agregar **Descripción** (opcional)

### Paso 2: Presupuesto
- Ingresar **Presupuesto Total** en CLP
- Sin restricción de monto
- Ejemplo: 45,000,000

### Paso 3: Criterios de Evaluación
Indicar el peso (%) de cada criterio:
- **Precio**: Importancia del costo (ej: 60%)
- **Técnica**: Calidad técnica (ej: 25%)
- **Experiencia**: Antecedentes (ej: 15%)
- **Otro**: Criterio adicional (ej: 0%)

⚠️ **IMPORTANTE**: Los porcentajes deben sumar exactamente **100%**

### Paso 4: Revisar y Publicar
1. Revisar todos los datos
2. Click **"Guardar como borrador"** (para editar después)
3. O click **"Publicar ahora"** (para que proveedores vean)

---

## 5. Ver Detalles de Licitación

1. Ir a **"Licitaciones"**
2. Click en la licitación deseada
3. Ver:
   - Datos generales (número, título, municipio)
   - Presupuesto total
   - Criterios de evaluación (barras visuales)
   - Botones de acción

### Acciones Disponibles
- **Editar**: Solo si está en BORRADOR
- **Publicar**: Solo si está en BORRADOR
- **Cambiar Estado**: Publicar → En Evaluación → Adjudicada
- **Eliminar**: Solo si está en BORRADOR

---

## 6. Recibir Ofertas

Una vez **PUBLICADA**, los proveedores pueden enviar ofertas.

### Para Ver Ofertas
1. Ir a detalles de licitación
2. Click tab **"Ofertas"**
3. Ver tabla con:
   - Número de oferta
   - Empresa proponente
   - Precio ofertado
   - Puntaje (si ya fue evaluada)
   - Estado (Pendiente/Evaluada)

---

## 7. Evaluar Ofertas

### Cambiar Estado a "En Evaluación"
1. Ir a detalles de licitación
2. Selector de estado
3. Cambiar a **"EN_EVALUACION"**
4. Confirmar en modal

### Evaluar Cada Oferta
1. En tab **"Ofertas"**
2. Click **"Evaluar"** en oferta
3. Aparecer sliders para:
   - **Precio**: Ajustar según criterio (0-100)
   - **Técnica**: Evaluar calidad (0-100)
   - **Experiencia**: Valorar antecedentes (0-100)

### Puntaje Automático
- El **Puntaje Total** se calcula automáticamente
- Ejemplo: Si precio=60%, técnica=25%, experiencia=15%
  - Oferta que puntúa 80/100 en precio
  - Oferta que puntúa 90/100 en técnica
  - **Puntaje Total = (80×0.6) + (90×0.25) + ... = 85.5**

### Guardar Evaluación
1. Click **"Guardar evaluación"**
2. Oferta se marca como **"Evaluada"**

---

## 8. Reportes

### Descargar PDF
1. Ir a detalles de licitación
2. Click botón **"📄 Descargar PDF"**
3. Se descarga archivo con:
   - Información de licitación
   - Tabla de todas las ofertas
   - Puntajes y estados
   - Fecha de generación

### Descargar Excel
1. Ir a detalles de licitación
2. Click botón **"📊 Descargar Excel"**
3. Se descarga archivo Excel con:
   - Número de oferta
   - Empresa
   - Precio
   - Puntaje total
   - Estado

### Usar Reportes
- Compartir con equipo evaluador
- Presentar a municipalidad
- Archivar para auditoría
- Análisis posterior

---

## 9. FAQ

### ¿Puedo cambiar el presupuesto después de publicar?
No. Si necesitas cambiar, debes eliminar y crear nueva licitación. Solo puedes editar en estado BORRADOR.

### ¿Cuántas ofertas puedo recibir?
Sin límite. KEVANZA soporta cualquier cantidad.

### ¿Puedo editar criterios de evaluación?
No después de publicar. Planifica bien antes de publicar.

### ¿Se pueden evaluadores acceder?
Por ahora solo el creador. En futuras versiones se agregará acceso de evaluadores.

### ¿Los datos se guardan automáticamente?
Sí. Cada cambio se guarda automáticamente en la nube.

### ¿Puedo recuperar licitaciones eliminadas?
No. Eliminar es permanente. Ten cuidado.

---

## 10. Soporte

### Contacto
- **Email**: soporte@kevanza.cl
- **Teléfono**: +56 9 XXXX-XXXX
- **Horario**: Lunes a Viernes, 09:00-18:00

### Problemas Comunes
- **No puedo ingresar**: Verifica email/contraseña. Si olvidas, usa "¿Olvidaste tu contraseña?"
- **Error al crear licitación**: Asegúrate de llenar todos los campos requeridos
- **PDF no descarga**: Intenta en otro navegador o limpia caché

---

## 11. Seguridad

- **Tus datos son privados**: Solo tú puedes ver tus licitaciones
- **Encriptado**: Todas las conexiones son seguras (HTTPS)
- **Backups automáticos**: Supabase realiza backups diarios
- **Contraseña segura**: Usa mínimo 8 caracteres, combina mayúsculas/números

---

**Última actualización**: 7 agosto 2026
**Versión**: 2.0 MVP
