import React, { useState, useEffect } from 'react';
import PaymentForm from '../components/PaymentForm';

const BillingDashboard = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchBills();
    fetchStats();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/billing/bills/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBills(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/billing/bills/dashboard_stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedBill(null);
    fetchBills();
    fetchStats();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showPaymentForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => setShowPaymentForm(false)}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Bills
          </button>
          <PaymentForm bill={selectedBill} onPaymentSuccess={handlePaymentSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Payments</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Bills</h3>
            <p className="text-2xl font-bold text-yellow-600">₹{stats.total_pending || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Overdue Bills</h3>
            <p className="text-2xl font-bold text-red-600">₹{stats.total_overdue || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Today's Collections</h3>
            <p className="text-2xl font-bold text-green-600">₹{stats.today_collections || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Monthly Collections</h3>
            <p className="text-2xl font-bold text-blue-600">₹{stats.monthly_collections || 0}</p>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Bills</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.bill_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.patient_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{bill.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{bill.paid_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(bill.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {bill.status !== 'paid' && (
                        <button
                          onClick={() => handlePayment(bill)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          💳 Pay
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        📄 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">💳 Accepted Payment Methods</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center p-3 border rounded-lg">
              <span className="text-2xl mr-2">💵</span>
              <span>Cash</span>
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <span className="text-2xl mr-2">📱</span>
              <span>UPI</span>
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <span className="text-2xl mr-2">💳</span>
              <span>Cards</span>
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <span className="text-2xl mr-2">🏦</span>
              <span>Net Banking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;