import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RealPaymentForm = ({ bill, onPaymentSuccess, onCancel }) => {
  const [paymentData, setPaymentData] = useState({
    amount: bill?.total_amount || 0,
    payment_method: 'cash',
    upi_id: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [processingFee, setProcessingFee] = useState(0);
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(bill?.patient_id || null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [paymentType, setPaymentType] = useState(bill?.payment_type || 'walkin');

  const paymentMethods = [
    { value: 'cash', label: 'Cash Payment', icon: '💵', description: 'Pay with cash at counter' },
    { value: 'upi', label: 'UPI/Scanner', icon: '📱', description: 'PhonePe, GPay, Paytm, QR Scanner' },
  ];

  useEffect(() => {
    // Only fetch patients for staff users, not for patient users
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isPatient = user.role === 'patient';

    if (!bill || !bill.id) {
      if (!isPatient) {
        console.log('Fetching patients for walk-in payment...');
        fetchPatients();
      }
    }
  }, []);

  useEffect(() => {
    calculateProcessingFee();
  }, [paymentData.amount, paymentData.payment_method]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      console.log('Token:', token ? 'Found' : 'Not found');
      if (!token) {
        setErrors({ general: 'Please login first' });
        setLoadingPatients(false);
        return;
      }
      console.log('Fetching from:', 'http://localhost:8000/api/patients/');
      const response = await axios.get('http://localhost:8000/api/patients/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Patients response:', response.data);
      setPatients(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setErrors({ general: 'Failed to load patients. Please refresh.' });
    } finally {
      setLoadingPatients(false);
    }
  };

  const calculateProcessingFee = () => {
    const amount = parseFloat(paymentData.amount) || 0;
    let fee = 0;

    switch (paymentData.payment_method) {
      case 'cash':
      case 'upi':
        fee = amount > 2000 ? Math.min(amount * 0.005, 15) : 0;
        break;
      case 'card':
        fee = amount * 0.018; // 1.8%
        break;
      case 'netbanking':
        fee = amount < 1000 ? 5 : 10;
        break;
      default:
        fee = 0;
    }

    setProcessingFee(Math.round(fee * 100) / 100);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentData.amount || paymentData.amount <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0';
    }

    if (!bill || !bill.id) {
      if (!selectedPatient) {
        newErrors.patient = 'Please select a patient';
      }
    }

    if (paymentData.payment_method === 'upi' && !showQR && !paymentData.upi_id) {
      newErrors.upi_id = 'UPI ID is required or generate QR code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setErrors({});
      const response = await axios.post(
        'http://localhost:8000/api/billing/payments/generate_qr_code/',
        {
          amount: parseFloat(paymentData.amount),
          bill_number: bill?.bill_number || 'PAYMENT'
        }
      );

      if (response.data.success) {
        setQrCode(response.data);
        setShowQR(true);
      }
    } catch (error) {
      console.error('QR generation error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to generate QR code. Check if backend is running.';
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Check if bill exists, if not use simple cash payment
      if (!bill || !bill.id || !bill.patient_id) {
        const response = await axios.post(
          'http://localhost:8000/api/billing/simple-cash-payment/',
          {
            patient_id: selectedPatient,
            amount: parseFloat(paymentData.amount),
            notes: paymentData.notes || 'Walk-in payment'
          }
        );

        if (response.data.success) {
          alert(`Payment Successful!\n\nTransaction ID: ${response.data.transaction_id}\nAmount: ₹${paymentData.amount}\nBill: ${response.data.bill_number}`);
          onPaymentSuccess(response.data);
        }
        return;
      }

      let endpoint = '';
      let requestData = {
        bill_id: bill.id,
        amount: parseFloat(paymentData.amount)
      };

      if (paymentData.payment_method === 'upi') {
        endpoint = '/api/billing/payments/process_upi_payment/';
        requestData.upi_id = paymentData.upi_id;
      } else if (paymentData.payment_method === 'cash') {
        endpoint = '/api/billing/payments/process_cash_payment/';
        requestData.notes = paymentData.notes;
      }

      const response = await axios.post(`http://localhost:8000${endpoint}`, requestData, config);

      if (response.data.success) {
        alert(`Payment Successful!\n\nTransaction ID: ${response.data.transaction_id}\nAmount: ₹${paymentData.amount}\nFee: ₹${response.data.fee || 0}`);
        onPaymentSuccess(response.data);
      } else {
        setErrors({ general: response.data.error || 'Payment failed' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({
        general: error.response?.data?.error || 'Payment processing failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentFields = () => {
    switch (paymentData.payment_method) {
      case 'upi':
        return (
          <div className="space-y-4">
            {!showQR ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="example@paytm / example@phonepe / example@gpay"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.upi_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    value={paymentData.upi_id}
                    onChange={(e) => setPaymentData({ ...paymentData, upi_id: e.target.value })}
                  />
                  {errors.upi_id && <p className="text-red-500 text-sm mt-1">{errors.upi_id}</p>}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">OR</p>
                  <button
                    type="button"
                    onClick={generateQRCode}
                    disabled={loading || !paymentData.amount}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    📱 Generate QR Code to Scan
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-green-500">
                  <h3 className="font-bold text-lg mb-2">Scan QR Code to Pay</h3>
                  <img
                    src={qrCode.qr_code}
                    alt="UPI QR Code"
                    className="mx-auto w-64 h-64"
                  />
                  <p className="text-sm text-gray-600 mt-2">Amount: ₹{qrCode.amount}</p>
                  <p className="text-sm text-gray-600">UPI ID: {qrCode.upi_id}</p>
                  <p className="text-xs text-gray-500 mt-2">Scan with any UPI app</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowQR(false); setQrCode(null); }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ← Enter UPI ID manually instead
                </button>
              </div>
            )}
          </div>
        );

      case 'cash':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-sm text-green-700">
                💵 <strong>Cash Payment:</strong> Please pay the amount at the reception counter.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Any additional notes..."
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">💳 Payment</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Bill Details */}
      {bill && bill.id ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Bill Details</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Bill No:</span> {bill.bill_number}</p>
            <p><span className="font-medium">Patient:</span> {bill.patient_name}</p>
            <p><span className="font-medium">Total Amount:</span> <span className="text-lg font-bold text-green-600">₹{bill.total_amount}</span></p>
            <p><span className="font-medium">Paid Amount:</span> ₹{bill.paid_amount}</p>
            <p><span className="font-medium">Balance:</span> <span className="text-lg font-bold text-red-600">₹{bill.total_amount - bill.paid_amount}</span></p>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-3 text-blue-900">
            {paymentType === 'emergency' ? '🚨 Emergency Payment' : '👥 Walk-in Payment'}
          </h3>

          {/* Payment Type Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('walkin')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${paymentType === 'walkin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                👥 Walk-in
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('emergency')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${paymentType === 'emergency'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                🚨 Emergency
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Patient <span className="text-red-500">*</span>
            </label>
            {loadingPatients ? (
              <p className="text-sm text-gray-500">Loading patients...</p>
            ) : (
              <select
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.patient ? 'border-red-500' : 'border-gray-300'
                  }`}
                value={selectedPatient || ''}
                onChange={(e) => setSelectedPatient(e.target.value)}
              >
                <option value="">-- Select Patient --</option>
                {patients
                  .filter(p => paymentType === 'emergency' ? p.is_emergency : true)
                  .map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patient_id} - {patient.first_name} {patient.last_name}
                      {patient.is_emergency ? ' 🚨' : ''}
                    </option>
                  ))}
              </select>
            )}
            {errors.patient && <p className="text-red-500 text-sm mt-1">{errors.patient}</p>}
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
          <div className="grid grid-cols-1 gap-2">
            {paymentMethods.map((method) => (
              <div
                key={method.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentData.payment_method === method.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:bg-gray-50'
                  }`}
                onClick={() => setPaymentData({ ...paymentData, payment_method: method.value })}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={method.value}
                  checked={paymentData.payment_method === method.value}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="mr-3"
                />
                <span className="text-lg mr-3">{method.icon}</span>
                <div>
                  <div className="font-medium">{method.label}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
          />
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
        </div>

        {/* Payment Method Specific Fields */}
        {renderPaymentFields()}

        {/* Processing Fee */}
        {processingFee > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              ⚠️ Processing fee: ₹{processingFee}
            </p>
          </div>
        )}

        {/* Payment Summary */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total to Pay:</span>
            <span className="text-xl font-bold text-blue-600">
              ₹{(parseFloat(paymentData.amount) + processingFee).toFixed(2)}
            </span>
          </div>
          {processingFee > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              Amount: ₹{paymentData.amount} + Fee: ₹{processingFee}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={processPayment}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay ₹${(parseFloat(paymentData.amount) + processingFee).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealPaymentForm;