# 🚀 CÓMO ACCEDER A LOS SERVIDORES

## ✅ URLs Correctas

### Admin Panel (React Admin)
```
http://localhost:3001
```
**NO uses:** `localhost:3001/admin` ni `localhost:5173/admin`

### 3D Pallet Viewer
```
http://localhost:5173
```
**NO uses:** `localhost:3000`

### Backend API
```
http://localhost:3000/api
```

## 🔍 Verificación Rápida

Abre tu navegador y verifica:

1. **Admin Panel**: http://localhost:3001
   - Deberías ver: Dashboard con KPIs, menú lateral con "Warehouse-orders" y "Tasks"
   - Si ves: Pantalla en blanco → Abre la consola del navegador (F12) y comparte el error

2. **3D Viewer**: http://localhost:5173
   - Deberías ver: Visualizador 3D de pallets con botón "AUTO"
   - Si ves: Pantalla en blanco → Abre la consola del navegador (F12) y comparte el error

## 🐛 Si ves pantalla en blanco

1. Presiona **F12** para abrir DevTools
2. Ve a la pestaña **Console**
3. Copia cualquier error en rojo
4. Compártelo conmigo

## 📝 Comandos para reiniciar

Si necesitas reiniciar los servidores:

```bash
# Detener todos los procesos node
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Iniciar todos los servidores
npm run dev:all
```

O individualmente:
```bash
npm run server      # Backend (puerto 3000)
npm run dev:admin   # Admin Panel (puerto 3001)
npm run dev:viewer  # 3D Viewer (puerto 5173)
```
