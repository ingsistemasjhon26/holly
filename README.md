# 🍺 Holly Club - Sistema de Gestión de Pedidos

Sistema completo de gestión de pedidos para restaurantes y clubes nocturnos con sincronización bidireccional a Google Sheets, dashboard de ventas y diseño responsive en blanco y negro.

## 🌐 Acceso a la Aplicación

**URL de la App:** https://h3ygh3m6naz2e.ok.kimi.link

## ✨ Características

### 📱 Funcionalidades Principales

- **Menú de Productos**: Catálogo organizado por categorías (Cervezas, No Alcohólicas, Licores, Adicionales)
- **Carrito de Compras**: Agregar, eliminar y modificar cantidades en tiempo real
- **Gestión de Pedidos**: Visualización por mesa con filtros y búsqueda
- **Reintentar Pedidos**: Al tocar un pedido existente, se puede reintentar fácilmente
- **Eliminar Pedidos/Productos**: Opción de eliminar pedidos completos o productos individuales
- **Dashboard de Ventas**: Gráficos y estadísticas con filtros por fecha
- **Sincronización con Google Sheets**: Backup automático en la nube

### 🎨 Diseño

- **Tema**: Blanco y Negro Premium
- **Responsive**: Optimizado para móviles, tablets y desktop
- **Logo**: Holly Club en la parte superior
- **Interfaz**: Moderna, limpia y fácil de usar

### 🔒 Seguridad

- Encriptación AES-CBC para datos sensibles
- Persistencia local segura
- Sincronización cifrada con Google Sheets

## 📊 Dashboard de Ventas

El dashboard incluye:

1. **Resumen General**:
   - Ventas Totales
   - Total de Pedidos
   - Ticket Promedio
   - Productos Vendidos

2. **Gráficos**:
   - Ventas por Día (gráfico de barras)
   - Ventas por Mesa (ranking)
   - Productos Más Vendidos (gráfico circular)

3. **Filtros de Fecha**:
   - Hoy
   - Esta Semana
   - Este Mes
   - Este Año
   - Personalizado (rango de fechas)

4. **Exportación**:
   - Exportar a CSV/Excel

## 🔗 Configuración de Google Sheets

### Paso 1: Crear el Script

1. Ve a [script.google.com](https://script.google.com)
2. Crea un nuevo proyecto
3. Borra el código por defecto
4. Copia y pega el código del archivo `HollyClub-AppsScript.js`
5. Guarda el proyecto (Ctrl+S)

### Paso 2: Implementar como App Web

1. Haz clic en **Implementar** → **Nueva implementación**
2. Selecciona tipo **Aplicación web**
3. Configura:
   - **Descripción**: Holly Club API
   - **Ejecutar como**: Yo
   - **Acceso**: Cualquiera
4. Haz clic en **Implementar**
5. Copia la URL generada

### Paso 3: Conectar la App

1. Abre la aplicación web
2. Haz clic en el icono de configuración (⚙️)
3. Pega la URL de Google Apps Script
4. Haz clic en **Probar** para verificar la conexión
5. Activa la sincronización
6. Guarda la configuración

## 📁 Estructura del Spreadsheet

El script crea automáticamente 3 hojas:

### 1. Pedidos
| Columna | Descripción |
|---------|-------------|
| ID | Identificador único del pedido |
| Fecha | Fecha del pedido |
| Hora | Hora del pedido |
| Mesa | Mesa o cliente |
| Productos | Lista de productos |
| Total | Total del pedido |
| Pago | Cantidad pagada |
| Cambio | Cambio devuelto |
| Estado | PAGADO / PENDIENTE |
| Timestamp | Fecha/hora exacta |

### 2. Ventas
| Columna | Descripción |
|---------|-------------|
| Fecha | Fecha de la venta |
| Total Ventas | Suma de ventas del día |
| Total Pedidos | Cantidad de pedidos |
| Ticket Promedio | Promedio por pedido |
| Productos Vendidos | Total de items |

### 3. Dashboard
- Métricas principales con fórmulas automáticas
- Ventas por día (QUERY)
- Ventas por mesa (QUERY)
- Se actualiza automáticamente

## 🚀 Uso de la Aplicación

### Crear un Pedido

1. Ve a la pestaña **Menú**
2. Selecciona productos (toca para agregar)
3. Ajusta cantidades con los botones + y -
4. Toca el botón flotante del carrito
5. Ingresa el número de mesa
6. Ingresa el monto pagado (opcional)
7. Toca **Registrar**

### Gestionar Pedidos

1. Ve a la pestaña **Pedidos**
2. Busca por mesa o producto
3. Filtra por estado (Todos, Pendientes, Pagados, Cancelados)
4. Toca el menú de opciones (⋮) para:
   - **Reintentar pedido**: Crear copia del pedido
   - **Marcar como pagado/pendiente**: Cambiar estado
   - **Eliminar pedido**: Borrar permanentemente
5. Expande un pedido para ver detalles y eliminar productos individuales

### Ver Dashboard de Ventas

1. Ve a la pestaña **Ventas**
2. Selecciona el rango de fechas deseado
3. Navega entre las pestañas:
   - **Resumen**: Estadísticas generales
   - **Gráficos**: Visualizaciones
   - **Productos**: Ranking de productos
4. Exporta datos con el botón **Exportar**

## 🔄 Sincronización

### Funcionamiento

- Los pedidos se guardan localmente primero
- Si la sincronización está activa, se envían a Google Sheets
- Los cambios de estado se sincronizan automáticamente
- Las eliminaciones también se reflejan en Sheets

### Indicadores de Estado

- 🟢 **Conectado**: Sincronización activa y funcionando
- 🟡 **Sincronizando**: Enviando datos
- 🔴 **Error**: Problema de conexión
- ⚪ **Sin conexión**: No configurado

## 📱 Compatibilidad

- ✅ iOS (Safari, Chrome)
- ✅ Android (Chrome, Samsung Internet)
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablets (iPad, Android tablets)

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Encriptación**: CryptoJS (AES-CBC)
- **Backend**: Google Apps Script
- **Almacenamiento**: localStorage + Google Sheets

## 📝 Notas

- Los datos se mantienen localmente incluso sin conexión
- La sincronización requiere conexión a internet
- El dashboard en Sheets se actualiza automáticamente mediante fórmulas QUERY
- Se recomienda hacer backup periódico del spreadsheet

## 🆘 Soporte

Si encuentras algún problema:

1. Verifica la URL de Google Apps Script
2. Comprueba que el script tenga permisos de acceso "Cualquiera"
3. Revisa la consola del navegador (F12) para errores
4. Intenta recargar la aplicación

---

**Desarrollado para Holly Club** 🍺
