import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, RefreshCw, User, Clock, Activity } from 'lucide-react';
import { getAuditLogs } from '../api/notifications';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        module: moduleFilter,
        action: actionFilter,
        limit: 200
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
    setLoading(false);
  };

  const getActionColor = (action) => {
    const colors = {
      create: 'bg-green-100 text-green-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      login: 'bg-purple-100 text-purple-700',
      logout: 'bg-gray-100 text-gray-700',
      dispatch: 'bg-orange-100 text-orange-700',
      status_change: 'bg-yellow-100 text-yellow-700',
      payment: 'bg-emerald-100 text-emerald-700',
      export: 'bg-cyan-100 text-cyan-700',
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  const filteredLogs = logs.filter(log =>
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user_name && log.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            Audit Log
          </h1>
          <p className="text-gray-600 text-sm">Track all system activity for compliance and monitoring</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search descriptions or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Modules</option>
            <option value="auth">Auth</option>
            <option value="patients">Patients</option>
            <option value="queue">Queue</option>
            <option value="billing">Billing</option>
            <option value="fleet">Fleet</option>
            <option value="staff">Staff</option>
            <option value="machines">Machines</option>
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="dispatch">Dispatch</option>
            <option value="status_change">Status Change</option>
            <option value="payment">Payment</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500 animate-pulse">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No audit logs found.</p>
            <p className="text-gray-400 text-sm mt-1">System activity will appear here as users perform actions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Module</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(log.created_at)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">{log.user_name || 'System'}</span>
                        {log.user_role && (
                          <span className="text-xs text-gray-400 ml-1">({log.user_role})</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-700">{log.module}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{log.description}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{log.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
