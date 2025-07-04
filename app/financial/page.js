"use client"
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export default function FinancialOverview() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchSessions(user.id);
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    }
  };

  const fetchSessions = async (psychologistId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*, patients(id, firstName, lastName)")
        .eq("psychologist_id", psychologistId)
        .order("session_date", { ascending: false });
      if (!error) setSessions(data || []);
    } catch (error) {}
    setLoading(false);
  };

  // Financial calculations
  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  const defaultAmount = 150;

  const unpaidSessions = sessions.filter(s => s.payment_status !== "paid");
  const paidThisMonth = sessions.filter(s => {
    if (s.payment_status !== "paid") return false;
    const d = new Date(s.session_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const revenueThisMonth = paidThisMonth.length * defaultAmount;
  const totalOutstanding = unpaidSessions.length * defaultAmount;



  // Generate month and year options
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];

  const years = [2023, 2024, 2025];

  // Calculate revenue for selected month
  const selectedMonthSessions = sessions.filter(s => {
    if (s.payment_status !== "paid") return false;
    const sessionDate = new Date(s.session_date);
    return sessionDate.getMonth() === selectedMonth && sessionDate.getFullYear() === selectedYear;
  });
  const selectedMonthRevenue = selectedMonthSessions.length * defaultAmount;

  // Calculate revenue for selected year
  const selectedYearSessions = sessions.filter(s => {
    if (s.payment_status !== "paid") return false;
    const sessionDate = new Date(s.session_date);
    return sessionDate.getFullYear() === selectedYear;
  });
  const selectedYearRevenue = selectedYearSessions.length * defaultAmount;

  // Calculate previous month comparison
  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  const prevMonthSessions = sessions.filter(s => {
    if (s.payment_status !== "paid") return false;
    const sessionDate = new Date(s.session_date);
    return sessionDate.getMonth() === prevMonth && sessionDate.getFullYear() === prevMonthYear;
  });
  const prevMonthRevenue = prevMonthSessions.length * defaultAmount;
  const monthComparison = prevMonthRevenue > 0 ? ((selectedMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(0) : 0;

  // Calculate previous year comparison
  const prevYearSessions = sessions.filter(s => {
    if (s.payment_status !== "paid") return false;
    const sessionDate = new Date(s.session_date);
    return sessionDate.getFullYear() === selectedYear - 1;
  });
  const prevYearRevenue = prevYearSessions.length * defaultAmount;
  const yearComparison = prevYearRevenue > 0 ? ((selectedYearRevenue - prevYearRevenue) / prevYearRevenue * 100).toFixed(0) : 0;

  // Generate monthly revenue data for chart (6 months starting from selected month/year)
  const generateMonthlyRevenueData = () => {
    const months = [];
    const startDate = new Date(selectedYear, selectedMonth, 1);
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const monthKey = date.getMonth();
      const yearKey = date.getFullYear();
      
      const monthRevenue = sessions.filter(s => {
        if (s.payment_status !== "paid") return false;
        const sessionDate = new Date(s.session_date);
        return sessionDate.getMonth() === monthKey && sessionDate.getFullYear() === yearKey;
      }).length * defaultAmount;
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      });
    }
    
    return months;
  };

  const monthlyRevenueData = generateMonthlyRevenueData();

  return (
    <div className="min-h-screen bg-gray-50 p-0 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 md:gap-0 px-4 md:px-0 pt-6 md:pt-0">
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 px-4 md:px-0">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-1">Total Outstanding</div>
          <div className="text-2xl font-bold text-red-600">€{totalOutstanding}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-1">Paid This Month</div>
          <div className="text-2xl font-bold text-green-600">€{paidThisMonth.length * defaultAmount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-1">Unpaid Sessions</div>
          <div className="text-2xl font-bold text-yellow-600">{unpaidSessions.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-1">This Month's Revenue</div>
          <div className="text-2xl font-bold text-blue-600">€{revenueThisMonth}</div>
        </div>
      </div>
      

      
      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Revenue Trends - Starting from {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
        </h2>
        
        {/* Time Controls */}
        <div className="flex flex-col sm:flex-row items-end gap-4 mb-6 justify-end">
          <div className="flex-1"></div>
          {/* Quick Period Buttons */}
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => {
                const now = new Date();
                setSelectedMonth(now.getMonth());
                setSelectedYear(now.getFullYear());
              }}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Current Month
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
                const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
                setSelectedMonth(prevMonth);
                setSelectedYear(prevYear);
              }}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Last Month
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setSelectedMonth(0); // January
                setSelectedYear(now.getFullYear());
              }}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              This Year
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setSelectedMonth(0); // January
                setSelectedYear(now.getFullYear() - 1);
              }}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Last Year
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`€${value}`, 'Revenue']}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* All Sessions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Sessions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-8">No sessions found</td>
                </tr>
              ) : (
                sessions.map(session => (
                  <tr key={session.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{session.patients?.firstName} {session.patients?.lastName}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(session.session_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">€150</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium 
                        ${session.payment_status === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' : session.payment_status === 'cancelled' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}
                      >
                        {session.payment_status || 'unpaid'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Unpaid Sessions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Unpaid Sessions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unpaidSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8">No unpaid sessions 🎉</td>
                </tr>
              ) : (
                unpaidSessions.map(session => (
                  <tr key={session.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{session.patients?.firstName} {session.patients?.lastName}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(session.session_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">€150</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium 
                        ${session.payment_status === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' : session.payment_status === 'cancelled' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}
                      >
                        {session.payment_status || 'unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button
                        onClick={async () => {
                          await supabase
                            .from('sessions')
                            .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
                            .eq('id', session.id);
                          fetchSessions(user.id);
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium mr-2"
                      >
                        Mark as Paid
                      </button>
                      <button
                        onClick={async () => {
                          await supabase
                            .from('sessions')
                            .update({ payment_status: 'cancelled', updated_at: new Date().toISOString() })
                            .eq('id', session.id);
                          fetchSessions(user.id);
                        }}
                        className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 