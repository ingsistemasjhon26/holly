// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - GOOGLE APPS SCRIPT v2.0
// Sincronización bidireccional con Dashboard de Ventas
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
        return addOrder(ss, data.data.order);
        
      case 'updateStatus':
        return updateOrderStatus(ss, data.data.id, data.data.status);
        
      case 'deleteOrder':
        return deleteOrder(ss, data.data.id);
        
      case 'syncSales':
        return syncSalesData(ss, data.data.salesData);
        
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
    
    // Ajustar anchos de columna
    ordersSheet.setColumnWidth(1, 150);  // ID
    ordersSheet.setColumnWidth(2, 100);  // Fecha
    ordersSheet.setColumnWidth(3, 80);   // Hora
    ordersSheet.setColumnWidth(4, 120);  // Mesa
    ordersSheet.setColumnWidth(5, 300);  // Productos
    ordersSheet.setColumnWidth(6, 100);  // Total
    ordersSheet.setColumnWidth(7, 100);  // Pago
    ordersSheet.setColumnWidth(8, 100);  // Cambio
    ordersSheet.setColumnWidth(9, 100);  // Estado
    ordersSheet.setColumnWidth(10, 150); // Timestamp
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
  sheet.getRange('A1').setFontColor('#000000');
  
  // Métricas principales
  sheet.getRange('A3').setValue('Métricas Principales');
  sheet.getRange('A3').setFontSize(14);
  sheet.getRange('A3').setFontWeight('bold');
  sheet.getRange('A3').setFontColor('#000000');
  
  const metrics = [
    ['Total Ventas', '=SUMIF(Pedidos!I:I,"PAGADO",Pedidos!F:F)'],
    ['Total Pedidos Pagados', '=COUNTIF(Pedidos!I:I,"PAGADO")'],
    ['Total Pedidos Pendientes', '=COUNTIF(Pedidos!I:I,"PENDIENTE")'],
    ['Ticket Promedio', '=AVERAGEIF(Pedidos!I:I,"PAGADO",Pedidos!F:F)']
  ];
  
  metrics.forEach((metric, i) => {
    sheet.getRange(4 + i, 1).setValue(metric[0]);
    sheet.getRange(4 + i, 2).setFormula(metric[1]);
    sheet.getRange(4 + i, 2).setNumberFormat('$#,##0');
    sheet.getRange(4 + i, 1).setFontWeight('bold');
  });
  
  // Ventas por día
  sheet.getRange('A9').setValue('Ventas por Día (Pedidos Pagados)');
  sheet.getRange('A9').setFontSize(14);
  sheet.getRange('A9').setFontWeight('bold');
  sheet.getRange('A9').setFontColor('#000000');
  
  sheet.getRange('A10').setValue('Fecha');
  sheet.getRange('B10').setValue('Total');
  sheet.getRange('C10').setValue('Pedidos');
  sheet.getRange('A10:C10').setFontWeight('bold');
  sheet.getRange('A10:C10').setBackground('#000000');
  sheet.getRange('A10:C10').setFontColor('#ffffff');
  
  // Fórmula para ventas por día (solo pagados)
  sheet.getRange('A11').setFormula('=QUERY(Pedidos!A:I, "SELECT B, SUM(F), COUNT(B) WHERE I = \'PAGADO\' GROUP BY B LABEL SUM(F) \'Total\', COUNT(B) \'Pedidos\'", 0)');
  
  // Ventas por mesa
  sheet.getRange('E9').setValue('Ventas por Mesa');
  sheet.getRange('E9').setFontSize(14);
  sheet.getRange('E9').setFontWeight('bold');
  sheet.getRange('E9').setFontColor('#000000');
  
  sheet.getRange('E10').setValue('Mesa');
  sheet.getRange('F10').setValue('Total');
  sheet.getRange('G10').setValue('Pedidos');
  sheet.getRange('E10:G10').setFontWeight('bold');
  sheet.getRange('E10:G10').setBackground('#000000');
  sheet.getRange('E10:G10').setFontColor('#ffffff');
  
  // Fórmula para ventas por mesa
  sheet.getRange('E11').setFormula('=QUERY(Pedidos!A:I, "SELECT D, SUM(F), COUNT(D) WHERE I = \'PAGADO\' GROUP BY D ORDER BY SUM(F) DESC LABEL SUM(F) \'Total\', COUNT(D) \'Pedidos\'", 0)');
  
  // Ajustar anchos
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(5, 150);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 100);
}

function updateDashboard(ss) {
  // El dashboard se actualiza automáticamente mediante fórmulas QUERY
  console.log('Dashboard actualizado - ' + new Date().toISOString());
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
    .addItem('Inicializar Hojas', 'initializeSheetsFromMenu')
    .addItem('Actualizar Dashboard', 'updateDashboardFromMenu')
    .addSeparator()
    .addItem('Limpiar Todo', 'clearAllData')
    .addToUi();
}

function initializeSheetsFromMenu() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  initializeSheets(ss);
  SpreadsheetApp.getUi().alert('✓ Hojas inicializadas correctamente');
}

function updateDashboardFromMenu() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  updateDashboard(ss);
  SpreadsheetApp.getUi().alert('✓ Dashboard actualizado');
}

function clearAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '⚠️ ¿Estás seguro?',
    'Esto eliminará TODOS los datos de pedidos y ventas. Esta acción no se puede deshacer.',
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
    ui.alert('✓ Datos eliminados correctamente');
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE UTILIDAD
// ═══════════════════════════════════════════════════════════════

function getOrdersByDate(date) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  const data = sheet.getDataRange().getValues();
  
  return data.filter((row, index) => {
    if (index === 0) return false; // Skip header
    return row[1] === date;
  });
}

function getTotalSalesByDateRange(startDate, endDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  const data = sheet.getDataRange().getValues();
  
  let total = 0;
  data.forEach((row, index) => {
    if (index === 0) return; // Skip header
    if (row[8] === 'PAGADO') {
      const rowDate = new Date(row[1]);
      if (rowDate >= new Date(startDate) && rowDate <= new Date(endDate)) {
        total += row[5];
      }
    }
  });
  
  return total;
}
