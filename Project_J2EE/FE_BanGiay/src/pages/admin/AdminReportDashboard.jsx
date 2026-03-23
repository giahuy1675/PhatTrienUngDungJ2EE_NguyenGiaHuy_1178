import { useMemo, useState, useEffect } from 'react';
import { DualAxes, Line } from '@ant-design/plots';
import reportService from '../../services/reportService';

function AdminReportDashboard() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [highStockProducts, setHighStockProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const [stats, products, lowStock, highStock, customers] = await Promise.all([
        reportService.getDashboardStats(),
        reportService.getTopSellingProducts(10),
        reportService.getLowStockProducts(),
        reportService.getHighStockProducts(100),
        reportService.getTopCustomers(10)
      ]);

      setDashboardStats(stats);
      setTopProducts(products);
      setLowStockProducts(lowStock);
      setHighStockProducts(highStock);
      setTopCustomers(customers);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const revenueTrendData = useMemo(() => {
    if (!dashboardStats) return [];
    return [
      { period: 'Hôm nay', value: Number(dashboardStats.todayRevenue || 0), metric: 'Doanh thu' },
      { period: 'Tuần này', value: Number(dashboardStats.weekRevenue || 0), metric: 'Doanh thu' },
      { period: 'Tháng này', value: Number(dashboardStats.monthRevenue || 0), metric: 'Doanh thu' },
    ];
  }, [dashboardStats]);

  const revenueLineConfig = {
    data: revenueTrendData,
    xField: 'period',
    yField: 'value',
    colorField: 'metric',
    point: { size: 6, shape: 'circle' },
    smooth: true,
    axis: {
      x: { title: 'Mốc thời gian' },
      y: { title: 'Doanh thu (VND)' },
    },
    tooltip: {
      items: [
        (d) => ({
          name: d.metric,
          value: formatCurrency(d.value),
        }),
      ],
    },
  };

  const businessBarsData = useMemo(() => {
    if (!dashboardStats) return [];
    return [
      { period: 'Hôm nay', value: Number(dashboardStats.newOrdersCount || 0), type: 'Đơn hàng mới' },
      { period: 'Hôm nay', value: Number(dashboardStats.totalProductsSold || 0), type: 'Sản phẩm bán' },
      { period: 'Hôm nay', value: Number(dashboardStats.newCustomersCount || 0), type: 'Khách hàng mới' },
    ];
  }, [dashboardStats]);

  const businessLineData = useMemo(() => {
    if (!dashboardStats) return [];
    return [
      {
        period: 'Hôm nay',
        count: Number(dashboardStats.newOrdersCount || 0) + Number(dashboardStats.newCustomersCount || 0),
      },
    ];
  }, [dashboardStats]);

  const businessDualAxesConfig = {
    data: [businessBarsData, businessLineData],
    xField: 'period',
    yField: ['value', 'count'],
    legend: true,
    geometryOptions: [
      {
        geometry: 'column',
        isStack: true,
        seriesField: 'type',
        columnWidthRatio: 0.5,
      },
      {
        geometry: 'line',
        color: '#FE911E',
        lineStyle: {
          lineWidth: 2,
        },
        point: {
          size: 5,
          shape: 'circle',
        },
      },
    ],
    yAxis: {
      value: {
        title: {
          text: 'Số lượng hoạt động',
        },
      },
      count: {
        title: {
          text: 'Tổng đơn + khách mới',
        },
      },
    },
  };

  const kpiCards = dashboardStats
    ? [
        {
          key: 'todayRevenue',
          label: 'Doanh thu hôm nay',
          value: formatCurrency(dashboardStats.todayRevenue),
          tone: 'blue',
          delta: '+8.2%',
          trend: 'up',
          caption: 'so với hôm qua',
          spark: [45, 52, 47, 60, 58, 66],
        },
        {
          key: 'weekRevenue',
          label: 'Doanh thu tuần này',
          value: formatCurrency(dashboardStats.weekRevenue),
          tone: 'emerald',
          delta: '+12.4%',
          trend: 'up',
          caption: 'so với tuần trước',
          spark: [38, 42, 50, 57, 62, 70],
        },
        {
          key: 'monthRevenue',
          label: 'Doanh thu tháng này',
          value: formatCurrency(dashboardStats.monthRevenue),
          tone: 'violet',
          delta: '+6.1%',
          trend: 'up',
          caption: 'so với tháng trước',
          spark: [30, 36, 40, 46, 50, 58],
        },
        {
          key: 'newOrders',
          label: 'Đơn hàng mới (hôm nay)',
          value: dashboardStats.newOrdersCount ?? 0,
          tone: 'orange',
          delta: '+3.5%',
          trend: 'up',
          caption: 'so với hôm qua',
          spark: [22, 28, 24, 30, 27, 33],
        },
        {
          key: 'productsSold',
          label: 'Sản phẩm đã bán (tháng)',
          value: dashboardStats.totalProductsSold ?? 0,
          tone: 'indigo',
          delta: '-2.1%',
          trend: 'down',
          caption: 'so với tháng trước',
          spark: [60, 55, 58, 53, 50, 48],
        },
        {
          key: 'newCustomers',
          label: 'Khách hàng mới (tháng)',
          value: dashboardStats.newCustomersCount ?? 0,
          tone: 'pink',
          delta: '+1.8%',
          trend: 'up',
          caption: 'so với tháng trước',
          spark: [14, 16, 15, 17, 18, 19],
        },
      ]
    : [];

  const toneClass = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    pink: 'border-pink-200 bg-pink-50 text-pink-700',
  };

  const toneLine = {
    blue: '#2563eb',
    emerald: '#059669',
    violet: '#7c3aed',
    orange: '#ea580c',
    indigo: '#4f46e5',
    pink: '#db2777',
  };

  const buildSparkPath = (values = []) => {
    const safe = values.map((v) => Number(v || 0));
    const max = Math.max(...safe, 1);
    const min = Math.min(...safe, 0);
    const range = max - min || 1;

    return safe
      .map((v, i) => {
        const x = (i / Math.max(safe.length - 1, 1)) * 100;
        const y = 100 - ((v - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Đang tải báo cáo...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Báo Cáo & Thống Kê</h1>
        <p className="text-gray-600 mt-2">Tổng quan về hoạt động kinh doanh</p>
      </div>

      {/* KPI Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {kpiCards.map((card) => (
            <div key={card.key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{card.value}</p>
                </div>
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${toneClass[card.tone]}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 16l4-4 4 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className={`text-sm font-semibold ${card.trend === 'down' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {card.delta}
                </span>
                <span className="text-xs text-gray-500">{card.caption}</span>
              </div>

              <div className="mt-3 h-10">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <polyline
                    points={buildSparkPath(card.spark)}
                    fill="none"
                    stroke={toneLine[card.tone]}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {dashboardStats && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ xu hướng doanh thu</h3>
            <Line {...revenueLineConfig} height={280} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ xu hướng hoạt động</h3>
            <DualAxes {...businessDualAxesConfig} height={280} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tổng Quan
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Báo Cáo Sản Phẩm
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Báo Cáo Khách Hàng
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Sản phẩm bán chạy */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Sản Phẩm Bán Chạy</h3>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <img
                    src={product.productImage || '/placeholder.png'}
                    alt={product.productName}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.productName}</p>
                    <p className="text-xs text-gray-500">Đã bán: {product.totalSold}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sản phẩm sắp hết hàng */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sản Phẩm Sắp Hết Hàng
              <span className="ml-2 text-sm font-normal text-red-600">(&lt; 10 sp)</span>
            </h3>
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Không có sản phẩm sắp hết hàng</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.productId} className="flex items-center gap-4">
                    <img
                      src={product.productImage || '/placeholder.png'}
                      alt={product.productName}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.productName}</p>
                      <p className="text-xs text-gray-500">Đã bán: {product.totalSold || 0}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Còn {product.stockQuantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Top 10 Sản phẩm bán chạy */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top 10 Sản Phẩm Bán Chạy Nhất</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản Phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tồn Kho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã Bán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh Thu
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((product, index) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.productImage || '/placeholder.png'}
                            alt={product.productName}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stockQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {product.totalSold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sản phẩm tồn kho cao - Cảnh báo ế */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Sản Phẩm Tồn Kho Cao - Cảnh Báo Ế
                <span className="ml-2 text-sm font-normal text-orange-600">(&gt; 100 sp)</span>
              </h3>
            </div>
            {highStockProducts.length === 0 ? (
              <div className="px-6 py-4">
                <p className="text-gray-500 text-sm italic">Không có sản phẩm tồn kho cao</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản Phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tồn Kho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đã Bán
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doanh Thu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {highStockProducts.map((product) => (
                      <tr key={product.productId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={product.productImage || '/placeholder.png'}
                              alt={product.productName}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.totalSold || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.revenue || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top 10 Khách Hàng Mua Nhiều Nhất</h3>
          </div>
          {topCustomers.length === 0 ? (
            <div className="px-6 py-4">
              <p className="text-gray-500 text-sm italic">Chưa có dữ liệu khách hàng</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách Hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số Đơn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng Chi Tiêu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trung Bình/Đơn
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topCustomers.map((customer, index) => (
                    <tr key={customer.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.fullName}
                        </div>
                        <div className="text-xs text-gray-500">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {customer.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(customer.averageOrderValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminReportDashboard;
