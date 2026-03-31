// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - CONFIG MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Link, CheckCircle, AlertCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import type { SyncConfig } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SyncConfig;
  onSave: (config: SyncConfig) => void;
  onTest: () => Promise<boolean>;
  isTesting: boolean;
}

export function ConfigModal({
  isOpen,
  onClose,
  config,
  onSave,
  onTest,
  isTesting,
}: ConfigModalProps) {
  const [url, setUrl] = useState(config.scriptUrl);
  const [enabled, setEnabled] = useState(config.enabled);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('connection');

  useEffect(() => {
    if (isOpen) {
      setUrl(config.scriptUrl);
      setEnabled(config.enabled);
      setTestResult(null);
    }
  }, [isOpen, config]);

  const handleTest = async () => {
    if (!url.trim()) return;
    const result = await onTest();
    setTestResult(result);
  };

  const handleSave = () => {
    onSave({
      ...config,
      scriptUrl: url.trim(),
      enabled: enabled && url.trim().length > 0,
    });
    onClose();
  };

  const copyScriptCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Link className="w-5 h-5" />
            Configuración de Sincronización
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-gray-950 border border-gray-800 mb-4">
            <TabsTrigger 
              value="connection" 
              className="flex-1 data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Conexión
            </TabsTrigger>
            <TabsTrigger 
              value="setup" 
              className="flex-1 data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Configuración Sheets
            </TabsTrigger>
          </TabsList>

          {/* Connection Tab */}
          <TabsContent value="connection" className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  config.enabled && config.status === 'synced' ? 'bg-green-500' :
                  config.enabled && config.status === 'error' ? 'bg-red-500' :
                  config.enabled ? 'bg-amber-500' : 'bg-gray-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-white">
                    {config.enabled && config.status === 'synced' ? 'Conectado' :
                     config.enabled && config.status === 'error' ? 'Error de conexión' :
                     config.enabled ? 'Configurado' : 'Sin configurar'}
                  </p>
                  {config.lastSync && (
                    <p className="text-xs text-gray-500">
                      Última sincronización: {new Date(config.lastSync).toLocaleString('es-CO')}
                    </p>
                  )}
                </div>
              </div>
              {config.enabled && (
                <Badge variant="outline" className="border-green-500/50 text-green-400">
                  Activo
                </Badge>
              )}
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label className="text-gray-300">URL de Google Apps Script</Label>
              <div className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/..."
                  className="flex-1 bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus:border-white"
                />
                <Button
                  onClick={handleTest}
                  disabled={!url.trim() || isTesting}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  {isTesting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Probar
                    </>
                  )}
                </Button>
              </div>
              {testResult !== null && (
                <div className={`flex items-center gap-2 text-sm ${
                  testResult ? 'text-green-400' : 'text-red-400'
                }`}>
                  {testResult ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Conexión exitosa
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      No se pudo conectar. Verifica la URL.
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Habilitar sincronización</p>
                <p className="text-xs text-gray-500">
                  Los pedidos se guardarán automáticamente en Google Sheets
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
                disabled={!url.trim()}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-white text-black hover:bg-gray-200"
              >
                Guardar Configuración
              </Button>
            </div>
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-4 text-gray-300">
              <div className="space-y-2">
                <h4 className="font-medium text-white">1. Crear el Script de Google</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-400">
                  <li>Ve a <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">script.google.com <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Crea un nuevo proyecto</li>
                  <li>Borra el código por defecto</li>
                  <li>Pega el código de abajo</li>
                  <li>Guarda el proyecto (Ctrl+S)</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white">2. Implementar como App Web</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-400">
                  <li>Haz clic en <strong>Implementar</strong> → <strong>Nueva implementación</strong></li>
                  <li>Selecciona tipo <strong>Aplicación web</strong></li>
                  <li>Configura:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Descripción: Holly Club API</li>
                      <li>Ejecutar como: <strong>Yo</strong></li>
                      <li>Acceso: <strong>Cualquiera</strong></li>
                    </ul>
                  </li>
                  <li>Haz clic en <strong>Implementar</strong></li>
                  <li>Copia la URL generada y pégala arriba</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white">3. Estructura del Spreadsheet</h4>
                <p className="text-sm text-gray-400">
                  El script creará automáticamente dos hojas:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                  <li><strong>Pedidos</strong>: Todos los pedidos registrados</li>
                  <li><strong>Ventas</strong>: Resumen de ventas con dashboard</li>
                </ul>
              </div>

              {/* Script Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Código del Script</h4>
                  <Button
                    onClick={copyScriptCode}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs text-gray-400 overflow-x-auto max-h-48 overflow-y-auto">
                  {APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

const APPS_SCRIPT_CODE = `// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - GOOGLE APPS SCRIPT
// Sincronización bidireccional con Google Sheets
// ═══════════════════════════════════════════════════════════════

const SHEET_NAMES = {
  ORDERS: 'Pedidos',
  SALES: 'Ventas',
  DASHBOARD: 'Dashboard'
};

const ORDER_HEADERS = ['ID', 'Fecha', 'Hora', 'Mesa', 'Productos', 'Total', 'Pago', 'Cambio', 'Estado', 'Timestamp'];
const SALES_HEADERS = ['Fecha', 'Total Ventas', 'Total Pedidos', 'Ticket Promedio', 'Productos Vendidos'];

// ═══════════════════════════════════════════════════════════════
// PUNTOS DE ENTRADA
// ═══════════════════════════════════════════════════════════════

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      success: true, 
      message: 'Holly Club API v2.0 - Activa',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Inicializar hojas si no existen
    initializeSheets(ss);
    
    switch (data.action) {
      case 'test':
        return jsonResponse({ success: true, message: 'Conexión exitosa' });
        
      case 'addOrder':
        return addOrder(ss, data.order);
        
      case 'updateStatus':
        return updateOrderStatus(ss, data.id, data.status);
        
      case 'deleteOrder':
        return deleteOrder(ss, data.id);
        
      case 'syncSales':
        return syncSalesData(ss, data.salesData);
        
      default:
        return jsonResponse({ success: false, error: 'Acción no reconocida' });
    }
  } catch (err) {
    console.error('Error:', err);
    return jsonResponse({ success: false, error: err.message });
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES PRINCIPALES
// ═══════════════════════════════════════════════════════════════

function addOrder(ss, order) {
  const sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  const row = [
    order.id,
    order.date,
    order.time,
    order.table,
    order.items,
    order.total,
    order.pay || 0,
    order.change || 0,
    order.status === 'paid' ? 'PAGADO' : 'PENDIENTE',
    new Date().toISOString()
  ];
  
  sheet.appendRow(row);
  const lastRow = sheet.getLastRow();
  
  // Formato de moneda
  sheet.getRange(lastRow, 6).setNumberFormat('$#,##0');
  sheet.getRange(lastRow, 7).setNumberFormat('$#,##0');
  sheet.getRange(lastRow, 8).setNumberFormat('$#,##0');
  
  // Color de estado
  const statusCell = sheet.getRange(lastRow, 9);
  if (order.status === 'paid') {
    statusCell.setBackground('#d4edda');
    statusCell.setFontColor('#155724');
  } else {
    statusCell.setBackground('#fff3cd');
    statusCell.setFontColor('#856404');
  }
  statusCell.setFontWeight('bold');
  
  // Actualizar dashboard
  updateDashboard(ss);
  
  return jsonResponse({ success: true, message: 'Pedido guardado' });
}

function updateOrderStatus(ss, id, status) {
  const sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const cell = sheet.getRange(i + 1, 9);
      const isPaid = status === 'paid';
      
      cell.setValue(isPaid ? 'PAGADO' : 'PENDIENTE');
      cell.setBackground(isPaid ? '#d4edda' : '#fff3cd');
      cell.setFontColor(isPaid ? '#155724' : '#856404');
      
      updateDashboard(ss);
      return jsonResponse({ success: true, message: 'Estado actualizado' });
    }
  }
  
  return jsonResponse({ success: false, error: 'Pedido no encontrado' });
}

function deleteOrder(ss, id) {
  const sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      updateDashboard(ss);
      return jsonResponse({ success: true, message: 'Pedido eliminado' });
    }
  }
  
  return jsonResponse({ success: false, error: 'Pedido no encontrado' });
}

function syncSalesData(ss, salesData) {
  const sheet = ss.getSheetByName(SHEET_NAMES.SALES);
  
  // Agregar nueva fila de ventas
  const row = [
    salesData.date,
    salesData.totalSales,
    salesData.totalOrders,
    salesData.averageTicket,
    salesData.totalItems
  ];
  
  sheet.appendRow(row);
  const lastRow = sheet.getLastRow();
  
  // Formato de moneda
  sheet.getRange(lastRow, 2).setNumberFormat('$#,##0');
  sheet.getRange(lastRow, 4).setNumberFormat('$#,##0');
  
  updateDashboard(ss);
  
  return jsonResponse({ success: true, message: 'Datos de ventas sincronizados' });
}

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN Y DASHBOARD
// ═══════════════════════════════════════════════════════════════

function initializeSheets(ss) {
  // Hoja de Pedidos
  let ordersSheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  if (!ordersSheet) {
    ordersSheet = ss.insertSheet(SHEET_NAMES.ORDERS);
    ordersSheet.appendRow(ORDER_HEADERS);
    formatHeaderRow(ordersSheet, ORDER_HEADERS.length);
  }
  
  // Hoja de Ventas
  let salesSheet = ss.getSheetByName(SHEET_NAMES.SALES);
  if (!salesSheet) {
    salesSheet = ss.insertSheet(SHEET_NAMES.SALES);
    salesSheet.appendRow(SALES_HEADERS);
    formatHeaderRow(salesSheet, SALES_HEADERS.length);
  }
  
  // Hoja de Dashboard
  let dashboardSheet = ss.getSheetByName(SHEET_NAMES.DASHBOARD);
  if (!dashboardSheet) {
    dashboardSheet = ss.insertSheet(SHEET_NAMES.DASHBOARD);
    setupDashboard(dashboardSheet);
  }
}

function formatHeaderRow(sheet, numCols) {
  const headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setBackground('#000000');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
}

function setupDashboard(sheet) {
  sheet.clear();
  
  // Título
  sheet.getRange('A1').setValue('HOLLY CLUB - DASHBOARD DE VENTAS');
  sheet.getRange('A1').setFontSize(18);
  sheet.getRange('A1').setFontWeight('bold');
  
  // Métricas principales
  sheet.getRange('A3').setValue('Métricas Principales');
  sheet.getRange('A3').setFontSize(14);
  sheet.getRange('A3').setFontWeight('bold');
  
  const metrics = [
    ['Total Ventas', '=SUM(Pedidos!F:F)'],
    ['Total Pedidos', '=COUNTA(Pedidos!A:A)-1'],
    ['Ticket Promedio', '=AVERAGE(Pedidos!F:F)'],
    ['Productos Vendidos', '=COUNTA(Pedidos!A:A)-1']
  ];
  
  metrics.forEach((metric, i) => {
    sheet.getRange(4 + i, 1).setValue(metric[0]);
    sheet.getRange(4 + i, 2).setFormula(metric[1]);
    sheet.getRange(4 + i, 2).setNumberFormat('$#,##0');
  });
  
  // Ventas por día
  sheet.getRange('A9').setValue('Ventas por Día');
  sheet.getRange('A9').setFontSize(14);
  sheet.getRange('A9').setFontWeight('bold');
  
  sheet.getRange('A10').setValue('Fecha');
  sheet.getRange('B10').setValue('Total');
  sheet.getRange('A10:B10').setFontWeight('bold');
  sheet.getRange('A10:B10').setBackground('#000000');
  sheet.getRange('A10:B10').setFontColor('#ffffff');
  
  // Fórmula para ventas por día
  sheet.getRange('A11').setFormula('=QUERY(Pedidos!A:I, "SELECT B, SUM(F) WHERE B IS NOT NULL GROUP BY B LABEL SUM(F) \'Total\'", 0)');
}

function updateDashboard(ss) {
  // El dashboard se actualiza automáticamente mediante fórmulas
  console.log('Dashboard actualizado');
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ═══════════════════════════════════════════════════════════════
// MENÚ PERSONALIZADO
// ═══════════════════════════════════════════════════════════════

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🍺 Holly Club')
    .addItem('Inicializar Hojas', 'initializeSheets')
    .addItem('Actualizar Dashboard', 'updateDashboard')
    .addSeparator()
    .addItem('Limpiar Todo', 'clearAllData')
    .addToUi();
}

function clearAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '¿Estás seguro?',
    'Esto eliminará todos los datos. Esta acción no se puede deshacer.',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    [SHEET_NAMES.ORDERS, SHEET_NAMES.SALES].forEach(name => {
      const sheet = ss.getSheetByName(name);
      if (sheet) {
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.deleteRows(2, lastRow - 1);
        }
      }
    });
    ui.alert('Datos eliminados correctamente');
  }
}`;

export default ConfigModal;
