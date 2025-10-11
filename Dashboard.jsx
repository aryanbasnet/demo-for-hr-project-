// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  ClipboardCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Active Jobs',
      value: dashboardData?.overview.activeJobs || 0,
      total: dashboardData?.overview.totalJobs || 0,
      icon: Briefcase,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      label: 'Total Candidates',
      value: dashboardData?.overview.totalCandidates || 0,
      icon: Users,
      color: 'bg-purple-500',
      change: '+8%'
    },
    {
      label: 'Shortlisted',
      value: dashboardData?.overview.shortlistedCandidates || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+15%'
    },
    {
      label: 'Active Onboarding',
      value: dashboardData?.overview.activeOnboarding || 0,
      icon: ClipboardCheck,
      color: 'bg-orange-500',
      change: '+5%'
    }
  ];

  const hiringTrendData = dashboardData?.charts.hiringTrend?.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    hires: item.count
  })) || [];

  const departmentData = dashboardData?.charts.candidatesByDepartment?.map(item => ({
    name: item._id || 'Other',
    value: item.count
  })) || [];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {stat.change && (
                  <span className="flex items-center text-sm font-medium text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
                {stat.total && (
                  <span className="text-lg text-gray-400 font-normal"> / {stat.total}</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hiringTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hires" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Candidates by Department */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidates by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
            <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium text-gray-700">Post New Job</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium text-gray-700">Review Candidates</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
            <ClipboardCheck className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium text-gray-700">Manage Onboarding</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;