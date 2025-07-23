"use client"
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { formatDate, formatDateMonthYear } from "../../lib/dateUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from "lucide-react";
import { Euro, AlertTriangle, CalendarDays } from "lucide-react";
import Button from '../../components/Button'
import CustomDropdown from '../../components/CustomDropdown';

export default function FinancialOverview() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const router = useRouter();
  const [editingStatusIdAllSessions, setEditingStatusIdAllSessions] = useState(null);
  const [editingStatusIdUnpaidSessions, setEditingStatusIdUnpaidSessions] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

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
      // Buscar todas as sessões do psicólogo
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('session_date', { ascending: false });

      if (sessionsError) {
        setSessions([]);
        setLoading(false);
        return;
      }

      if (sessionsData && sessionsData.length > 0) {
        // Buscar os pacientes associados
        const patientIds = [...new Set(sessionsData.map(session => session.patient_id))];
        let patientsData = [];
        if (patientIds.length > 0) {
          const { data: patients, error: patientsError } = await supabase
            .from('patients')
            .select('id, firstName, lastName')
            .in('id', patientIds);
          if (!patientsError) {
            patientsData = patients;
          }
        }
        // Merge manual dos dados do paciente
        const sessionsWithPatients = sessionsData.map(session => {
          const patient = patientsData.find(p => p.id === session.patient_id);
          return {
            ...session,
            patients: patient || { firstName: 'Unknown', lastName: 'Patient' }
          };
        });
        setSessions(sessionsWithPatients);
      } else {
        setSessions([]);
      }
    } catch (error) {
      setSessions([]);
    }
    setLoading(false);
  };

  // Financial calculations
  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const isPaid = s => s.payment_status === "paid" || s.payment_status === "invoice issued";

  const unpaidSessions = sessions.filter(s => !isPaid(s));
  const paidThisMonth = sessions.filter(s => {
    if (!isPaid(s)) return false;
    const d = new Date(s.session_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const revenueThisMonth = paidThisMonth.reduce((sum, s) => sum + (s.session_fee || 0), 0);
  const totalOutstanding = unpaidSessions.reduce((sum, s) => sum + (s.session_fee || 0), 0);

  // Card 1: Faturação do mês atual
  const faturacaoMesAtual = sessions.filter(s => {
    if (!isPaid(s)) return false;
    const d = new Date(s.session_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).reduce((sum, s) => sum + (s.session_fee || 0), 0);

  // Card 2: Pagamentos em falta (sessões não pagas com data passada)
  const pagamentosEmFalta = sessions.filter(s => {
    if (isPaid(s)) return false;
    const d = new Date(s.session_date);
    return d < today;
  }).reduce((sum, s) => sum + (s.session_fee || 0), 0);

  // Card 3: Unrealized Sessions
  const unrealizedProfit = sessions.filter(s => {
    if (isPaid(s)) return false;
    const d = new Date(s.session_date);
    return d >= today;
  }).reduce((sum, s) => sum + (s.session_fee || 0), 0);

  // Total realizado este ano
  const realizadoAno = sessions.filter(s => {
    if (!isPaid(s)) return false;
    const d = new Date(s.session_date);
    return d.getFullYear() === thisYear;
  }).reduce((sum, s) => sum + (s.session_fee || 0), 0);

  // Contagem de sessões em falta (pagamentos em falta)
  const countPagamentosEmFalta = sessions.filter(s => {
    if (isPaid(s)) return false;
    const d = new Date(s.session_date);
    return d < today;
  }).length;

  // Contagem de unrealized sessions
  const countUnrealizedProfit = sessions.filter(s => {
    if (isPaid(s)) return false;
    const d = new Date(s.session_date);
    return d >= today;
  }).length;

  // Generate month and year options
  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ];

  const years = [2023, 2024, 2025];

  // Calculate revenue for selected month
  const selectedMonthSessions = sessions.filter(s => {
    if (!isPaid(s)) return false;
    const sessionDate = new Date(s.session_date);
    return sessionDate.getMonth() === selectedMonth && sessionDate.getFullYear() === selectedYear;
  });
  const selectedMonthRevenue = selectedMonthSessions.reduce((sum, s) => sum + (s.session_fee || 0), 0);

  // Calculate revenue for selected year
  const selectedYearSessions = sessions.filter(s => {
    if (!isPaid(s)) return false;
    const sessionDate = new Date(s.session_date);
    return sessionDate.getFullYear() === selectedYear;
  });
  const selectedYearRevenue = selectedYearSessions.reduce((sum, s) => sum + (s.session_fee || 0), 0);

  // Calculate previous month comparison
  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  const prevMonthSessions = sessions.filter(s => {
    if (!isPaid(s)) return false;
    const sessionDate = new Date(s.session_date);
    return sessionDate.getMonth() === prevMonth && sessionDate.getFullYear() === prevMonthYear;
  });
  const prevMonthRevenue = prevMonthSessions.reduce((sum, s) => sum + (s.session_fee || 0), 0);
  const monthComparison = prevMonthRevenue > 0 ? ((selectedMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(0) : 0;

  // Calculate previous year comparison
  const prevYearSessions = sessions.filter(s => {
    if (!isPaid(s)) return false;
    const sessionDate = new Date(s.session_date);
    return sessionDate.getFullYear() === selectedYear - 1;
  });
  const prevYearRevenue = prevYearSessions.reduce((sum, s) => sum + (s.session_fee || 0), 0);
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
        if (!isPaid(s)) return false;
        const sessionDate = new Date(s.session_date);
        return sessionDate.getMonth() === monthKey && sessionDate.getFullYear() === yearKey;
      }).reduce((sum, s) => sum + (s.session_fee || 0), 0);
      
      months.push({
        month: formatDateMonthYear(date.toISOString()),
        revenue: monthRevenue
      });
    }
    
    return months;
  };

  const monthlyRevenueData = generateMonthlyRevenueData();

  // Adicionar função handleStatusChange
  const statusOptions = [
    { value: "paid", label: "Pago" },
    { value: "to pay", label: "Não Pago" },
    { value: "invoice issued", label: "Fatura Emitida" }
  ];

  const handleStatusChange = async (sessionId, newStatus) => {
    await supabase
      .from("sessions")
      .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", sessionId);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, payment_status: newStatus } : s
      )
    );
  };

  function getStatusBadge(status) {
    let badgeClass = "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border cursor-pointer transition-all duration-150 group relative";
    let colorClass = "";
    if (status === 'paid') {
      colorClass = "bg-green-100 text-green-800 border-green-200 group-hover:bg-green-200";
    } else if (status === 'cancelled') {
      colorClass = "bg-red-100 text-red-800 border-red-200 group-hover:bg-red-200";
    } else if (status === 'invoice issued') {
      colorClass = "bg-blue-100 text-blue-800 border-blue-200 group-hover:bg-blue-200";
    } else if (status === 'to pay') {
      colorClass = "bg-gray-100 text-gray-600 border-gray-300 group-hover:bg-gray-200";
    } else {
      colorClass = "bg-gray-100 text-gray-800 border-gray-200 group-hover:bg-gray-200";
    }
    return (
      <span className={`${badgeClass} ${colorClass}`} tabIndex={0}>
        {status === 'invoice issued' ? 'Fatura Emitida' : status === 'to pay' ? 'A Pagar' : status === 'paid' ? 'Pago' : status === 'cancelled' ? 'Cancelado' : 'Não Pago'}
        <span className="flex flex-col ml-1">
          <ChevronUp className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 -mb-1" />
          <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 -mt-1" />
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-30">Clique para editar o estado</span>
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] p-0 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 md:gap-0 px-4 md:px-0 pt-6 md:pt-0">
        <h1 className="text-2xl font-bold text-gray-900">Resumo Financeiro</h1>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 px-4 md:px-0">
        {/* Receita deste Mês */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Euro className="w-6 h-6 text-blue-700" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-base font-bold text-gray-700 truncate">Receita deste Mês</div>
              <div className="text-[11px] text-gray-400 truncate whitespace-nowrap">Total faturado no mês atual</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 text-right mt-4 w-full">€{faturacaoMesAtual}</div>
          <div className="text-[11px] text-gray-400 text-right w-full mt-1">Receita deste Ano: €{realizadoAno}</div>
        </div>
        {/* Pagamentos em Falta */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-base font-bold text-gray-700 truncate">Pagamentos em Falta</div>
              <div className="text-[11px] text-gray-400 truncate whitespace-nowrap">Sessões passadas não pagas</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 text-right mt-4 w-full">€{pagamentosEmFalta}</div>
          <div className="text-[11px] text-gray-400 text-right w-full mt-1">Sessões: {countPagamentosEmFalta}</div>
        </div>
        {/* Sessões Futuras Não Pagas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-base font-bold text-gray-700 truncate">Sessões Futuras Não Pagas</div>
              <div className="text-[11px] text-gray-400 truncate whitespace-nowrap">Sessões futuras ainda não pagas</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 text-right mt-4 w-full">€{unrealizedProfit}</div>
          <div className="text-[11px] text-gray-400 text-right w-full mt-1">Sessões: {countUnrealizedProfit}</div>
        </div>
      </div>
      

      
      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Evolução da Receita - Desde {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
        </h2>
        
        {/* Time Controls */}
        <div className="flex flex-col sm:flex-row items-end gap-4 mb-6 justify-end">
          <div className="flex-1"></div>
          {/* Quick Period Buttons */}
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              onClick={() => {
                const now = new Date();
                setSelectedMonth(now.getMonth());
                setSelectedYear(now.getFullYear());
              }}
              size="sm"
            >
              Mês Atual
            </Button>
            <Button
              onClick={() => {
                const now = new Date();
                const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
                const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
                setSelectedMonth(prevMonth);
                setSelectedYear(prevYear);
              }}
              size="sm"
              variant="secondary"
            >
              Mês Anterior
            </Button>
            <Button
              onClick={() => {
                const now = new Date();
                setSelectedMonth(0); // January
                setSelectedYear(now.getFullYear());
              }}
              size="sm"
              variant="secondary"
            >
              Este Ano
            </Button>
            <button
              onClick={() => {
                const now = new Date();
                setSelectedMonth(0); // January
                setSelectedYear(now.getFullYear() - 1);
              }}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ano Anterior
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
                formatter={(value) => [`€${value}`, 'Receita']}
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
      
      {/* Unpaid Sessions Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Sessões Não Pagas
        </h2>
        <div className="overflow-visible">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 w-1/4">Paciente</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 w-1/4">Data</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600 w-1/4 pr-8">Valor</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 w-1/4 pl-8">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unpaidSessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-8">Nenhuma sessão não paga 🎉</td>
                </tr>
              ) : (
                unpaidSessions.map(session => (
                  <tr key={session.id}>
                    <td className="px-4 py-2 whitespace-nowrap w-1/4">{session.patients?.firstName || '—'} {session.patients?.lastName || ''}</td>
                    <td className="px-4 py-2 whitespace-nowrap w-1/4">{session.session_date ? formatDate(session.session_date) : '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right font-mono w-1/4 pr-8">{typeof session.session_fee === 'number' ? `€${session.session_fee}` : '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap w-1/4 pl-8">
                      {editingStatusIdUnpaidSessions === session.id ? (
                        <div className="relative">
                          <div className="absolute left-0 bottom-full mb-2 w-full bg-white border border-gray-200 rounded z-50">
                            {statusOptions.map(opt => (
                              <button
                                key={opt.value}
                                className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${session.payment_status === opt.value ? 'font-semibold text-blue-600' : 'text-gray-900'}`}
                                onClick={async () => {
                                  await handleStatusChange(session.id, opt.value);
                                  setEditingStatusIdUnpaidSessions(null);
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <CustomDropdown
                          value={session.payment_status}
                          options={statusOptions}
                          onChange={(value) => handleStatusChange(session.id, value)}
                          disabled={false}
                          placeholder="Estado"
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* All Sessions Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Todas as Sessões
        </h2>
        {/* Filtros de status */}
        <div className="flex flex-wrap gap-2 mb-6 justify-end">
          {[
            { key: 'all', label: 'Todas as Sessões' },
            { key: 'to pay', label: 'A Pagar' },
            { key: 'paid', label: 'Pago' },
            { key: 'invoice issued', label: 'Fatura Emitida' },
            { key: 'cancelled', label: 'Cancelado' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200
                ${statusFilter === f.key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="overflow-visible">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 w-1/4">Paciente</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 w-1/4">Data</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600 w-1/4 pr-8">Valor</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 w-1/4 pl-8">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(statusFilter === 'all' ? sessions : sessions.filter(s => s.payment_status === statusFilter)).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-8">Nenhuma sessão encontrada</td>
                </tr>
              ) : (
                (statusFilter === 'all' ? sessions : sessions.filter(s => s.payment_status === statusFilter)).map(session => (
                  <tr key={session.id}>
                    <td className="px-4 py-2 whitespace-nowrap w-1/4">{session.patients?.firstName || '—'} {session.patients?.lastName || ''}</td>
                    <td className="px-4 py-2 whitespace-nowrap w-1/4">{session.session_date ? formatDate(session.session_date) : '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right font-mono w-1/4 pr-8">{typeof session.session_fee === 'number' ? `€${session.session_fee}` : '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap w-1/4 pl-8">
                      {editingStatusIdAllSessions === session.id ? (
                        <div className="relative">
                          <div className="absolute left-0 bottom-full mb-2 w-full bg-white border border-gray-200 rounded z-50">
                            {statusOptions.map(opt => (
                              <button
                                key={opt.value}
                                className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${session.payment_status === opt.value ? 'font-semibold text-blue-600' : 'text-gray-900'}`}
                                onClick={async () => {
                                  await handleStatusChange(session.id, opt.value);
                                  setEditingStatusIdAllSessions(null);
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <CustomDropdown
                          value={session.payment_status}
                          options={statusOptions}
                          onChange={(value) => handleStatusChange(session.id, value)}
                          disabled={false}
                          placeholder="Estado"
                        />
                      )}
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