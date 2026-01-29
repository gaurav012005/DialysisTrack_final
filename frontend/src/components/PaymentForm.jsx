import React, { useState } from 'react';

const PaymentForm = ({ bill, onPaymentSuccess }) => {
  const [paymentData, setPaymentData] = useState({
    amount: bill?.total_amount || 0,
    payment_method: 'upi',
    upi_id: '',
    transaction_id: '',
    reference_number: '',
    bank_name: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: '💵 Cash', icon: '💵' },
    { value: 'upi', label: '📱 UPI (PhonePe/GPay/Paytm)', icon: '📱' },
    { value: 'card', label: '💳 Debit/Credit Card', icon: '💳' },
    { value: 'netbanking', label: '🏦 Net Banking', icon: '🏦' },
    { value: 'cheque', label: '📝 Cheque', icon: '📝' },
    { value: 'neft', label: '🏛️ NEFT/RTGS', icon: '🏛️' },
    { value: 'insurance', label: '🛡️ Insurance', icon: '🛡️' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/billing/payments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          ...paymentData,
          bill: bill.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        onPaymentSuccess(result);
        alert('Payment processed successfully!');
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentFields = () => {
    switch (paymentData.payment_method) {
      case 'upi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">UPI ID</label>
              <input
                type="text"
                placeholder="example@paytm / example@phonepe"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={paymentData.upi_id}
                onChange={(e) => setPaymentData({ ...paymentData, upi_id: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
              <input
                type="text"
                placeholder="UPI Transaction ID"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={paymentData.transaction_id}
                onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
              />
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
              <input
                type="text"
                placeholder="Card Transaction ID"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={paymentData.transaction_id}
                onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                type="text"
                placeholder="e.g., SBI, HDFC, ICICI"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={paymentData.bank_name}
                onChange={(e) => setPaymentData({ ...paymentData, bank_name: e.target.value })}
              />
            </div>
          </div>
        );

      case 'netbanking':
      case 'neft':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                type="text"
                placeholder="e.g., State Bank of India"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={paymentData.bank_name}
                onChange={(e) => setPaymentData({ ...paymentData, bank_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference Number</label>
              <input
                type="text"
                placeholder="Bank Reference Number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={paymentData.reference_number}
                onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })}
              />
            </div>
          </div>
        );

      case 'cheque':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cheque Number</label>
              <input
                type="text"
                placeholder="Cheque Number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={paymentData.reference_number}
                onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                type="text"
                placeholder="Bank Name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={paymentData.bank_name}
                onChange={(e) => setPaymentData({ ...paymentData, bank_name: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">💳 Payment</h2>

      {bill && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold">Bill Details</h3>
          <p>Bill No: {bill.bill_number}</p>
          <p>Patient: {bill.patient_name}</p>
          <p className="text-lg font-bold text-green-600">Amount: ₹{bill.total_amount}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <div className="grid grid-cols-1 gap-2">
            {paymentMethods.map((method) => (
              <label key={method.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment_method"
                  value={method.value}
                  checked={paymentData.payment_method === method.value}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="mr-3"
                />
                <span className="text-lg mr-2">{method.icon}</span>
                <span>{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
            required
          />
        </div>

        {renderPaymentFields()}

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows="3"
            value={paymentData.notes}
            onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
            placeholder="Any additional notes..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay ₹${paymentData.amount}`}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;