# KEVANZA - Manual de Administrador

## 1. Acceso a Paneles

### Supabase Dashboard
- **URL**: https://supabase.com/dashboard
- **Proyecto**: kevanza-mvp
- **Region**: São Paulo (sa-east-1)

### Vercel Dashboard
- **URL**: https://vercel.com/dashboard
- **Proyecto**: kevanza-mvp
- **Repository**: aldfig-sketch/kevanza-mvp

### GitHub Repository
- **URL**: https://github.com/aldfig-sketch/kevanza-mvp
- **Branch**: main (producción)

---

## 2. Gestión de Usuarios

### Crear Nuevo Usuario

**Opción 1: Mediante Supabase Auth (Recomendado)**
1. Ir a Supabase Dashboard
2. Click en **Authentication > Users**
3. Click botón **"Add user"**
4. Ingresar email del municipio
5. Click **"Auto generate password"**
6. Click **"Create new user"**
7. Verificar email para activar cuenta

**Opción 2: Mediante Interfaz KEVANZA**
1. Usuario va a https://kevanza-mvp.vercel.app
2. Click **"Registrarse"**
3. Completa formulario
4. Email se registra automáticamente

### Asignar Rol (Si es Necesario)

**Para Admin Municipio:**
1. Ir a Supabase > SQL Editor
2. Ejecutar:
```sql
UPDATE usuarios 
SET rol = 'ADMIN_MUNICIPIO' 
WHERE email = 'nuevo@municipio.cl';
```

3. Alternativamente, usar Table Editor:
   - Supabase > Editor > Tabla usuarios
   - Buscar usuario por email
   - Actualizar columna 'rol'
   - Guardar

### Resetear Contraseña

**Para Usuario que Olvida Contraseña:**
1. Usuario click **"¿Olvidaste tu contraseña?"** en login
2. Ingresa email
3. Recibe email con enlace
4. Click enlace y crea nueva contraseña

**Para Admin (Reset Forzado):**
1. Supabase > Authentication > Users
2. Buscar usuario
3. Click el usuario
4. Click **"Reset password"**
5. Envía email al usuario

---

## 3. Base de Datos

### Tablas Principales

**licitaciones**
- id: Integer (Primary Key)
- numero: Text (unique)
- titulo: Text
- descripcion: Text
- estado: Text (BORRADOR/PUBLICADA/EN_EVALUACION/ADJUDICADA)
- municipio_id: Integer (Foreign Key)
- tipo_licita: Text
- presupuesto_total: Numeric
- ponderacion_precio: Numeric
- ponderacion_tecnica: Numeric
- ponderacion_experiencia: Numeric
- ponderacion_otro: Numeric
- created_at: Timestamp
- created_by: UUID (Foreign Key usuarios)

**usuarios**
- id: UUID (Primary Key, from auth.users)
- email: Text
- rol: Text (MUNICIPIO/ADMIN_MUNICIPIO/SUPER_ADMIN)
- municipio_id: Integer
- nombre: Text
- created_at: Timestamp

### Backups Automáticos

**Supabase realiza:**
- Backup diario a las 02:00 UTC
- Retención de 30 días
- Encriptado automático

**Para Descargar Backup Manual:**
1. Supabase > Settings > Backups
2. Click licitación
3. Click backup deseado
4. Click **"Download"**

### Restaurar desde Backup

⚠️ **OPERACIÓN DESTRUCTIVA - Solo si es emergencia**

1. Supabase > Settings > Backups
2. Click backup a restaurar
3. Click **"Restore"**
4. Confirmar en diálogo
5. Esperar 5-10 minutos
6. Verificar datos

---

## 4. Monitoreo y Logs

### Logs de Vercel

1. Vercel Dashboard > kevanza-mvp
2. Click **"Logs"**
3. Ver:
   - Deployment logs (compilación)
   - Runtime logs (errores en tiempo real)
   - Filtrar por nivel (info/warning/error)

### Logs de Supabase

1. Supabase Dashboard > Logs
2. Ver:
   - API logs (requests)
   - Database logs (queries)
   - Auth logs (logins)
3. Filtrar por timestamp/usuario

### Analytics

**Vercel Analytics:**
- Performance (Core Web Vitals)
- Traffic (pageviews/users)
- Bandwidth

**Supabase Metrics:**
- Database usage
- API requests
- Storage usage

---

## 5. Maintenance

### Weekly Tasks
- [ ] Revisar logs de error
- [ ] Verificar backup completó
- [ ] Revisar usuarios nuevos

### Monthly Tasks
- [ ] Revisar analytics
- [ ] Actualizar documentación
- [ ] Verificar espacio en base de datos
- [ ] Revisar ofertas completadas

### Quarterly Tasks
- [ ] Security audit
- [ ] Performance optimization
- [ ] Update dependencies
- [ ] Backup restoration test

---

## 6. Troubleshooting

### Aplicación Lenta
1. Vercel > Analytics > Performance
2. Supabase > Metrics > Database
3. Posibles causas:
   - Base de datos grande (ejecutar query lenta)
   - Funciones sin índices
   - Mucho tráfico simultáneo

**Solución:**
- Agregar índices a tablas frecuentes
- Optimizar queries
- Usar caché

### Login No Funciona
1. Verificar status de Supabase Auth en dashboard
2. Revisar logs en Supabase > Logs
3. Verificar URL correcta: ibgxezibscvdyjpxlglv.supabase.co
4. Limpiar caché del navegador

### PDF/Excel No Descarga
1. Verificar JavaScript habilitado en navegador
2. Revisar consola del navegador (F12)
3. Verificar navegador compatible (Chrome/Firefox/Safari)
4. Intentar en incógnito

### Datos No Guardan
1. Verificar conexión a internet
2. Verificar Supabase online (status.supabase.com)
3. Revisar logs en Supabase
4. Probar en otra máquina

---

## 7. Escalabilidad Futura

### Cuando Llegues a:
- **100 licitaciones**: Optimizar queries
- **1000 licitaciones**: Considerar particionamiento
- **10000 licitaciones**: Evaluar migración

### Mejoras Planeadas
- [ ] Acceso multi-usuario para evaluadores
- [ ] Sistema de notificaciones (email/SMS)
- [ ] API pública para integraciones
- [ ] Dashboard analytics avanzado
- [ ] Firma digital de reportes

---

## 8. Seguridad

### Requerimientos Mínimos
✅ HTTPS siempre (Vercel + Supabase)
✅ Contraseñas fuertes (8+ caracteres)
✅ 2FA para admin (Supabase Auth)
✅ Row Level Security (RLS) habilitado
✅ Backups encriptados

### Checklist de Seguridad
- [ ] RLS policies revisadas
- [ ] API keys rotadas (cada 90 días)
- [ ] Logs monitoreados
- [ ] Accesos al admin auditados
- [ ] SSL/TLS válido

---

## 9. Contacto y Soporte

**Para Issues Técnicos:**
- Verificar status.supabase.com
- Revisar logs en dashboard
- Contactar soporte Supabase si es problema de infraestructura

**Para Issues de Aplicación:**
- Email: dev@kevanza.cl
- GitHub Issues: aldfig-sketch/kevanza-mvp

---

**Última actualización**: 7 agosto 2026
**Versión**: 2.0 MVP
**Autor**: Claude Haiku 4.5
