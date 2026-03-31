// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - SALES DASHBOARD VIEW COMPONENT (Premium)
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Receipt, 
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { Order, DateRange } from '@/types';
import { useSales } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SalesViewProps {
  orders: Order[];
}

const CHART_COLORS = ['#00d4ff', '#b829dd', '#ff00ff', '#525252', '#404040', '#262626'];

export function SalesView({ orders }: SalesViewProps) {
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { stats, filteredOrders, applyDateRange, exportToExcel } = useSales(orders);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    if (range === 'custom' && customStartDate && customEndDate) {
      applyDateRange(range, customStartDate, customEndDate);
    } else {
      applyDateRange(range);
    }
  };

  const handleExport = () => {
    const { data, sheetName } = exportToExcel();
    
    // Create CSV content
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${sheetName}.csv`;
    link.click();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  const dateRangeLabels: Record<DateRange, string> = {
    today: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    year: 'Este Año',
    custom: 'Personalizado',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect border-b border-white/10 p-4 space-y-4">
        {/* Title & Export */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400/20 to-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-gradient">Dashboard de Ventas</span>
          </h2>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="border-white/20 text-gray-300 hover:bg-white/10 hover:border-cyan-400/50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {(Object.keys(dateRangeLabels) as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={`filter-pill whitespace-nowrap ${dateRange === range ? 'active' : ''}`}
              >
                {dateRangeLabels[range]}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 focus:outline-none"
              />
              <Button
                onClick={() => handleDateRangeChange('custom')}
                size="sm"
                className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
              >
                Aplicar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-black/50 border border-white/10 mb-4 p-1">
            <TabsTrigger 
              value="overview" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:border-cyan-400/50 rounded-lg"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:border-cyan-400/50 rounded-lg"
            >
              Gráficos
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:border-cyan-400/50 rounded-lg"
            >
              Productos
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Ventas Totales"
                value={formatPrice(stats.totalSales)}
                icon={DollarSign}
                trend={stats.totalSales > 0 ? 'up' : 'neutral'}
              />
              <StatCard
                title="Total Pedidos"
                value={stats.totalOrders.toString()}
                icon={Receipt}
                trend={stats.totalOrders > 0 ? 'up' : 'neutral'}
              />
              <StatCard
                title="Ticket Promedio"
                value={formatPrice(stats.averageTicket)}
                icon={ShoppingBag}
                trend="neutral"
              />
              <StatCard
                title="Productos Vendidos"
                value={filteredOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0).toString()}
                icon={TrendingUp}
                trend="neutral"
              />
            </div>

            {/* Recent Orders */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-cyan-400" />
                  </div>
                  Pedidos Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{order.table}</p>
                        <p className="text-xs text-gray-500">{order.date} · {order.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gradient">{formatPrice(order.total)}</p>
                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                      </div>
                    </div>
                  ))}
                  {filteredOrders.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No hay pedidos en este período</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-4">
            {/* Sales Chart */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                  </div>
                  Ventas por Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.salesByDate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={12}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.9)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px'
                        }}
                        formatter={(value: number) => [formatPrice(value), 'Ventas']}
                      />
                      <Bar dataKey="total" fill="url(#gradient)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00d4ff" />
                          <stop offset="100%" stopColor="#b829dd" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sales by Table */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-400/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  Ventas por Mesa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.salesByTable.slice(0, 5).map((table) => (
                    <div key={table.table} className="flex items-center justify-between">
                      <span className="text-sm text-white font-medium">{table.table}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                            style={{
                              width: `${(table.total / (stats.salesByTable[0]?.total || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gradient w-20 text-right">
                          {formatPrice(table.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stats.salesByTable.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-400/20 flex items-center justify-center">
                    <PieChartIcon className="w-4 h-4 text-pink-400" />
                  </div>
                  Productos Más Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Pie Chart */}
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.topProducts.slice(0, 5)}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {stats.topProducts.slice(0, 5).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.9)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px'
                        }}
                        formatter={(value: number) => [formatPrice(value), 'Ventas']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Products List */}
                <div className="space-y-3">
                  {stats.topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-cyan-400">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.quantity} vendidos</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gradient">
                        {formatPrice(product.total)}
                      </span>
                    </div>
                  ))}
                  {stats.topProducts.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: typeof DollarSign;
  trend: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="stats-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${
          trend === 'up' ? 'bg-green-500/20' : 
          trend === 'down' ? 'bg-red-500/20' : 
          'bg-white/10'
        }`}>
          <Icon className={`w-5 h-5 ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 
            'text-gray-400'
          }`} />
        </div>
      </div>
    </div>
  );
}

export default SalesView;
