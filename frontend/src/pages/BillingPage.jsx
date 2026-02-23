import React, { useState, useEffect } from 'react';
import RealPaymentForm from '../components/RealPaymentForm';

const BillingPage = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
    fetchStats();
  }, []);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await fetch('http://localhost:8000/api/billing/bills/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Bills data:', data);
        setBills(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      if (!token) return;
      const response = await fetch('http://localhost:8000/api/billing/bills/dashboard_stats/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Stats data:', data);
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePayment = (bill = null) => {
    const defaultBill = {
      id: null,
      patient_id: null,
      bill_number: 'NEW-PAYMENT',
      patient_name: 'Walk-in Patient',
      total_amount: 0,
      paid_amount: 0
    };
    setSelectedBill(bill || defaultBill);
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
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Bills
          </button>
          <RealPaymentForm
            bill={selectedBill}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentForm(false)}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Payments</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
            <h2 className="text-lg font-medium text-gray-900">Bills & Payments</h2>
          </div>

          {bills.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No bills found</p>
              <p className="text-sm text-gray-400">Bills will appear here once created</p>
            </div>
          ) : (
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
                            className="text-blue-600 hover:text-blue-900 mr-3 bg-blue-50 px-3 py-1 rounded"
                          >
                            💳 Pay Now
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
          )}
        </div>

        {/* Payment Methods Info */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">💳 Accepted Payment Methods</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handlePayment()}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors cursor-pointer"
            >
              <span className="text-2xl mr-2">💵</span>
              <span>Cash</span>
            </button>
            <button
              onClick={() => handlePayment()}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors cursor-pointer"
            >
              <span className="text-2xl mr-2">📱</span>
              <span>UPI/Scanner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;