import React, { useState, useEffect } from 'react';
import RealPaymentForm from '../components/RealPaymentForm';
import { downloadReceiptPDF } from '../utils/pdfDownload';

const BillingPage = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

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

  const handlePayment = (bill = null, defaultMethod = 'cash') => {
    const defaultBill = {
      id: null,
      patient_id: null,
      bill_number: 'NEW-PAYMENT',
      patient_name: 'Walk-in Patient',
      total_amount: 0,
      paid_amount: 0,
      defaultMethod,
    };
    const billToUse = bill ? { ...bill, defaultMethod } : defaultBill;
    setSelectedBill(billToUse);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedBill(null);
    fetchBills();
    fetchStats();
  };

  const handleDeleteBill = async (billId, billNumber) => {
    if (!window.confirm(`Are you sure you want to completely delete bill ${billNumber}? This cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/billing/bills/${billId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok || response.status === 204) {
        setBills(bills.filter(b => b.id !== billId));
        fetchStats();
      } else {
        const errorText = await response.text();
        alert(`Failed to delete bill: ${errorText}`);
      }
    } catch (err) {
      console.error('Error deleting bill:', err);
      alert('An error occurred while deleting the bill.');
    }
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

  const handleDownloadReceipt = (bill) => {
    setDownloadingId(bill.id);
    try {
      downloadReceiptPDF(bill, {
        name: bill.patient_name || 'Patient',
        patient_id: bill.patient_id || 'N/A',
      });
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 1500);
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
            defaultMethod={selectedBill?.defaultMethod || 'cash'}
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Billing & Payments</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Bills</h3>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Rs.{stats.total_pending || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue Bills</h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">Rs.{stats.total_overdue || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Collections</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">Rs.{stats.today_collections || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Collections</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Rs.{stats.monthly_collections || 0}</p>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-100 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Bills & Payments</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="🔍 Search by bill no. or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100 dark:placeholder-gray-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-auto dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>

          {bills.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No bills found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Bills will appear here once created</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bill No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {bills
                  .filter(bill => {
                    const matchesSearch = !searchTerm || 
                      (bill.bill_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (bill.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesStatus = !statusFilter || bill.status === statusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {bill.bill_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {bill.patient_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        Rs.{bill.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        Rs.{bill.paid_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {bill.payment_method ? (
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            bill.payment_method === 'Cash' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          }`}>
                            {bill.payment_method === 'Cash' ? '💵' : '📱'} {bill.payment_method}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs">&mdash;</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(bill.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2 flex-wrap">
                          {bill.status !== 'paid' && (
                            <button
                              onClick={() => handlePayment(bill)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-xs font-medium transition-colors"
                            >
                              💳 Pay Now
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadReceipt(bill)}
                            disabled={downloadingId === bill.id}
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-60"
                          >
                            {downloadingId === bill.id ? (
                              <><span className="animate-spin">⏳</span> Generating...</>
                            ) : (
                              <>📄 Receipt PDF</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Methods Info */}
        <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">💳 Accepted Payment Methods</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handlePayment(null, 'cash')}
              className="flex items-center p-3 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-green-50 dark:hover:bg-slate-700 hover:border-green-500 transition-colors group"
            >
              <span className="text-2xl mr-3">💵</span>
              <div className="text-left">
                <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400">Cash</div>
                <div className="text-xs text-gray-500">Pay at reception counter</div>
              </div>
            </button>
            <button
              onClick={() => handlePayment(null, 'upi')}
              className="flex items-center p-3 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700 hover:border-purple-500 transition-colors group"
            >
              <span className="text-2xl mr-3">💳</span>
              <div className="text-left">
                <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-400">Online Payment (Razorpay)</div>
                <div className="text-xs text-gray-500">UPI · PhonePe · GPay · Card</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;