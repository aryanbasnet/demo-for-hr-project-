// frontend/src/pages/Onboarding.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Onboarding = () => {
  const [onboardingRecords, setOnboardingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOnboarding();
  }, [statusFilter]);

  const fetchOnboarding = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/onboarding`;
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOnboardingRecords(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching onboarding records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle className="h-5 w-5 text-green-500" />,
      in_progress: <Clock className="h-5 w-5 text-yellow-500" />,
      not_started: <XCircle className="h-5 w-5 text-gray-400" />
    };
    return icons[status] || icons.not_started;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      not_started: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredRecords = onboardingRecords.filter(record => {
    if (!record.employee) return false;
    const fullName = `${record.employee.firstName} ${record.employee.lastName}`.toLowerCase();
    const employeeId = record.employeeId.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || employeeId.includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading onboarding records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding</h1>
          <p className="text-gray-600 mt-1">{filteredRecords.length} total records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Onboarding Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <div key={record._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {record.employee?.firstName?.charAt(0)}{record.employee?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {record.employee?.firstName} {record.employee?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{record.employeeId}</p>
                  </div>
                </div>
                {getStatusIcon(record.overallStatus)}
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-medium text-gray-900">{record.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium text-gray-900">{record.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(record.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-700">
                    {record.completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${record.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.overallStatus)}`}>
                  {record.overallStatus.replace('_', ' ')}
                </span>
              </div>

              <Link
                to={`/onboarding/${record._id}`}
                className="flex items-center justify-center space-x-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No onboarding records found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Onboarding;