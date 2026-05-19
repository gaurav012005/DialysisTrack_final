import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EMERGENCY_SURCHARGE_RATE = 0.20; // 20% surcharge for emergency patients

const RealPaymentForm = ({ bill, defaultMethod = 'cash', onPaymentSuccess, onCancel }) => {
  const [paymentData, setPaymentData] = useState({
    amount: bill?.total_amount || 0,
    payment_method: defaultMethod,
    upi_id: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [processingFee, setProcessingFee] = useState(0);
  const [emergencySurcharge, setEmergencySurcharge] = useState(0);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(bill?.patient_id || bill?.patient || null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [paymentType, setPaymentType] = useState(bill?.payment_type || 'walkin');
  // IDs of patients already with a paid/pending bill today (to prevent duplicates)
  const [paidPatientIds, setPaidPatientIds] = useState(new Set());
  // IDs of patients currently in the queue
  const [queuePatientIds, setQueuePatientIds] = useState(new Set());

  // FIX ISSUE 9: Consistent indentation
  const paymentMethods = [
    { value: 'cash', label: 'Cash Payment', icon: '💵', description: 'Pay with cash at counter' },
    { value: 'upi', label: 'UPI / QR Code (Razorpay)', icon: '📱', description: 'PhonePe · GPay · Paytm · Any UPI app' },
    { value: 'razorpay', label: 'Card / Netbanking (Razorpay)', icon: '💳', description: 'Credit Card, Debit Card, Netbanking' },
  ];

  // FIX ISSUE 8: Check for existing script before adding a duplicate
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src*="checkout.razorpay"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isPatient = user.role === 'patient';
    if (!bill || !bill.id) {
      if (!isPatient) {
        fetchPatients();
        fetchPaidPatients();
        fetchQueuePatients();
      }
    }
  }, []);

  useEffect(() => {
    calculateProcessingFee();
  }, [paymentData.amount, paymentData.payment_method]);

  // Emergency surcharge: applies when a walk-in emergency patient is selected
  useEffect(() => {
    if (!bill || !bill.id) {
      const patient = patients.find(p => String(p.id) === String(selectedPatient));
      if (patient?.is_emergency) {
        const surcharge = (parseFloat(paymentData.amount) || 0) * EMERGENCY_SURCHARGE_RATE;
        setEmergencySurcharge(Math.round(surcharge * 100) / 100);
      } else {
        setEmergencySurcharge(0);
      }
    }
  }, [selectedPatient, patients, paymentData.amount]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      if (!token) { setErrors({ general: 'Please login first' }); setLoadingPatients(false); return; }
      const response = await axios.get('http://localhost:8000/api/patients/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPatients(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setErrors({ general: 'Failed to load patients. Please refresh.' });
    } finally {
      setLoadingPatients(false);
    }
  };

  // Fetch today's paid/pending bills to prevent double payment
  const fetchPaidPatients = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      if (!token) return;
      const response = await axios.get('http://localhost:8000/api/billing/bills/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const billsList = response.data.results || response.data;
      const today = new Date().toISOString().slice(0, 10);
      // Collect patient IDs that have a paid OR pending bill created today
      const ids = new Set(
        billsList
          .filter(b => (b.status === 'paid' || b.status === 'pending') &&
            (b.created_at || b.due_date || '').slice(0, 10) === today)
          .map(b => String(b.patient))
      );
      setPaidPatientIds(ids);
    } catch (err) {
      console.error('Error fetching bills for dup-check:', err);
    }
  };

  // Fetch active queue to sort queue patients first in dropdown
  const fetchQueuePatients = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      if (!token) return;
      const response = await axios.get('http://localhost:8000/api/queue/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const queueList = response.data.results || response.data;
      const ids = new Set(
        queueList
          .filter(q => q.status === 'waiting' || q.status === 'in_progress')
          .map(q => String(q.patient))
      );
      setQueuePatientIds(ids);
    } catch (err) {
      console.error('Error fetching queue:', err);
    }
  };

  const calculateProcessingFee = () => {
    const amount = parseFloat(paymentData.amount) || 0;
    let fee = 0;
    switch (paymentData.payment_method) {
      case 'razorpay':
        fee = amount * 0.018; // 1.8% card/netbanking fee
        break;
      case 'upi':
        fee = amount * 0.0; // UPI is free via Razorpay
        break;
      default:
        fee = 0;
    }
    setProcessingFee(Math.round(fee * 100) / 100);
  };

  // FIX ISSUE 6: Strict amount validation + FIX ISSUE 2: NaN patient ID guard
  const validateForm = () => {
    const newErrors = {};
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0';
    }
    if (!bill || !bill.id) {
      const patientId = parseInt(selectedPatient);
      if (!selectedPatient || isNaN(patientId)) {
        newErrors.patient = 'Please select a patient';
      } else if (paidPatientIds.has(String(selectedPatient))) {
        newErrors.patient = 'This patient already has a bill recorded today. No duplicate payment allowed.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    // Total includes base amount + online processing fee + emergency surcharge
    const totalAmount = parseFloat(paymentData.amount) + processingFee + emergencySurcharge;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // ── Razorpay / UPI — shared order flow ──────────────────────────────
      // Both 'razorpay' (card/netbanking) and 'upi' open the Razorpay checkout
      // The only difference is that UPI pre-selects the UPI tab.
      if (paymentData.payment_method === 'razorpay' || paymentData.payment_method === 'upi') {
        const isUPI = paymentData.payment_method === 'upi';
        // STEP 1: Load Razorpay checkout SDK
        const res = await loadRazorpayScript();
        if (!res) {
          setErrors({ general: 'Razorpay SDK failed to load. Are you online?' });
          setLoading(false);
          return;
        }

        // Guard walk-in patient selection
        if (!bill || !bill.id) {
          const patientId = parseInt(selectedPatient);
          if (isNaN(patientId)) {
            setErrors({ patient: 'Please select a valid patient' });
            setLoading(false);
            return;
          }
        }

        try {
          // STEP 2: Create order on our backend (calls Razorpay API)
          const orderRes = await axios.post(
            'http://localhost:8000/api/billing/razorpay/create-order/',
            {
              amount: totalAmount,
              bill_id: (bill && bill.id) ? bill.id : null,
              patient_id: (!bill || !bill.id) ? parseInt(selectedPatient) : null,
              notes: paymentData.notes || '',
            },
            config
          );

          if (!orderRes.data.success) {
            setErrors({ general: orderRes.data.error || 'Failed to create payment order' });
            setLoading(false);
            return;
          }

          const { order_id, key_id, amount: amountPaise, currency } = orderRes.data;

          // STEP 3: Open Razorpay Checkout Modal
          const options = {
            key: key_id,
            amount: amountPaise,
            currency: currency,
            name: 'DialysisTrack Hospital',
            description: emergencySurcharge > 0
              ? 'Bill Payment (Emergency Surcharge Applied)'
              : isUPI ? 'UPI / QR Bill Payment' : 'Dialysis Bill Payment',
            order_id: order_id,
            // ── Show UPI tab first when user chose UPI method ──
            config: {
              display: {
                blocks: {
                  utib: { name: 'UPI / QR Code', instruments: [{ method: 'upi' }] },
                  other: { name: 'Card / Netbanking', instruments: [{ method: 'card' }, { method: 'netbanking' }] },
                },
                sequence: isUPI ? ['block.utib', 'block.other'] : ['block.other', 'block.utib'],
                preferences: { show_default_blocks: false },
              },
            },
            handler: async function (response) {
              // STEP 4: Verify payment signature on our backend
              try {
                const verifyRes = await axios.post(
                  'http://localhost:8000/api/billing/razorpay/verify/',
                  {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    amount: totalAmount,
                    bill_id: (bill && bill.id) ? bill.id : null,
                    patient_id: (!bill || !bill.id) ? parseInt(selectedPatient) : null,
                    notes: paymentData.notes || '',
                    payment_sub_method: isUPI ? 'upi' : 'razorpay',
                  },
                  config
                );

                if (verifyRes.data.success) {
                  setErrors({
                    success: `✅ Payment Successful! Transaction ID: ${response.razorpay_payment_id}`
                  });
                  setTimeout(() => onPaymentSuccess(verifyRes.data), 2000);
                } else {
                  setErrors({ general: verifyRes.data.error || 'Payment verification failed' });
                }
              } catch (verifyErr) {
                console.error('Verification error:', verifyErr);
                setErrors({ general: 'Error verifying payment on server. Please contact support.' });
              }
              document.body.classList.remove('razorpay-modal-open');
              setLoading(false);
            },
            prefill: {
              name: bill?.patient_name || 'Patient',
              email: 'test@example.com',
              contact: '9999999999',
            },
            theme: { color: '#0284c7' },
            modal: {
              ondismiss: function () {
                document.body.classList.remove('razorpay-modal-open');
                setLoading(false);
              }
            }
          };

          const paymentObject = new window.Razorpay(options);
          paymentObject.on('payment.failed', function (failResponse) {
            document.body.classList.remove('razorpay-modal-open');
            setErrors({
              general: `Payment failed: ${failResponse.error.description || 'Unknown error'}. Please try again.`
            });
            setLoading(false);
          });
          document.body.classList.add('razorpay-modal-open');
          paymentObject.open();

        } catch (orderErr) {
          console.error('Order creation failed:', orderErr);
          setErrors({
            general: orderErr.response?.data?.error || 'Failed to initiate payment. Please try again.'
          });
          setLoading(false);
        }
        return;
      }

      // ── Walk-in payment (no existing bill) ───────────────────────────────
      if (!bill || !bill.id) {
        const patientId = parseInt(selectedPatient);
        const surchargeNote = emergencySurcharge > 0
          ? `[Emergency Surcharge: ₹${emergencySurcharge}] `
          : '';

        let endpoint, payload;

        // FIX ISSUE 1: Walk-in UPI must use quick_payment endpoint
        if (paymentData.payment_method === 'upi') {
          endpoint = 'http://localhost:8000/api/billing/payments/quick_payment/';
          payload = {
            patient_id: patientId,
            amount: totalAmount,
            payment_method: 'upi',
            upi_id: paymentData.upi_id || 'UPI_SCANNED',
            notes: `${surchargeNote}${paymentData.notes || 'Walk-in UPI payment'}`
          };
        } else {
          endpoint = 'http://localhost:8000/api/billing/simple-cash-payment/';
          payload = {
            patient_id: patientId,
            amount: totalAmount,
            payment_method: paymentData.payment_method,
            notes: `${surchargeNote}${paymentData.notes || `Walk-in ${paymentData.payment_method} payment`}`
          };
        }

        const response = await axios.post(endpoint, payload, config);
        if (response.data.success) {
          const txnId = response.data.transaction_id || 'N/A';
          setErrors({ success: `✅ Payment Successful! Transaction ID: ${txnId} | Bill: ${response.data.bill_number}` });
          setTimeout(() => onPaymentSuccess(response.data), 2000);
        } else {
          setErrors({ general: response.data.error || 'Payment failed' });
        }
        return;
      }

      // ── Existing bill payment ─────────────────────────────────────────────
      const surchargeNote = emergencySurcharge > 0
        ? `[Emergency Surcharge: ₹${emergencySurcharge}] `
        : '';
      let endpoint, requestData;

      // FIX ISSUE 3: UPI bill payments must use process_upi_payment endpoint
      if (paymentData.payment_method === 'upi') {
        endpoint = '/api/billing/payments/process_upi_payment/';
        requestData = {
          bill_id: bill.id,
          amount: totalAmount,
          upi_id: paymentData.upi_id || '',
          qr_confirmed: !paymentData.upi_id, // true if patient scanned QR (no UTR entered)
          notes: `${surchargeNote}UPI Payment. ${paymentData.notes || ''}`
        };
      } else {
        endpoint = '/api/billing/payments/process_cash_payment/';
        requestData = {
          bill_id: bill.id,
          amount: totalAmount,
          notes: `${surchargeNote}${paymentData.notes || ''}`
        };
      }

      const response = await axios.post(`http://localhost:8000${endpoint}`, requestData, config);
      if (response.data.success) {
        const txnId = response.data.transaction_id || 'N/A';
        const fee = response.data.fee || 0;
        setErrors({
          success: `✅ Payment Received! Transaction ID: ${txnId}${fee > 0 ? ` | Fee: ₹${fee}` : ''}`
        });
        setTimeout(() => onPaymentSuccess(response.data), 2500);
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
      case 'razorpay':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                💳 <strong>Online Payment:</strong> You will be redirected to Razorpay securely. Test mode is active.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
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

      case 'upi': {
        // FIX ISSUE 7: Show placeholder warning; real UPI ID must be configured
        const totalForQR = (parseFloat(paymentData.amount) + processingFee + emergencySurcharge).toFixed(2);
        const hospitalUpi = 'hospital@upi'; // ⚠️ Replace with actual hospital UPI ID before go-live
        const upiLink = `upi://pay?pa=${hospitalUpi}&pn=DialysisTrack&am=${totalForQR}&cu=INR`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-md">
              <p className="text-sm text-purple-700 mb-4">
                📱 <strong>UPI Payment:</strong> Scan the QR code below with any UPI app (GPay, PhonePe, Paytm).
              </p>
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-purple-200">
                <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48 mb-4 border p-2 rounded" />
                <p className="font-mono text-sm font-semibold">{hospitalUpi}</p>
                <p className="text-xs text-gray-500 mt-1">Amount: ₹{totalForQR}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID / UTR (Optional)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 12-digit UTR number after payment"
                value={paymentData.upi_id}
                onChange={(e) => setPaymentData({ ...paymentData, upi_id: e.target.value })}
              />
            </div>
          </div>
        );
      }

      case 'cash':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-sm text-green-700">
                💵 <strong>Cash Payment:</strong> Please pay the amount at the reception counter.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
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

  const totalToPay = (parseFloat(paymentData.amount) || 0) + processingFee + emergencySurcharge;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">💳 Payment</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('walkin')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${paymentType === 'walkin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                👥 Walk-in
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('emergency')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${paymentType === 'emergency' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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
            ) : (() => {
              // Build grouped lists
              const base = patients.filter(p =>
                paymentType === 'emergency' ? p.is_emergency : true
              );
              // Exclude patients who already have a bill today
              const available = base.filter(p => !paidPatientIds.has(String(p.id)));

              const emergency = available.filter(p => p.is_emergency);
              const inQueue   = available.filter(p => !p.is_emergency && queuePatientIds.has(String(p.id)));
              const normal    = available.filter(p => !p.is_emergency && !queuePatientIds.has(String(p.id)));

              const renderOpt = (p) => (
                <option key={p.id} value={p.id}>
                  {p.patient_id} – {p.first_name} {p.last_name}
                </option>
              );

              return (
                <select
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.patient ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={selectedPatient || ''}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  <option value="">-- Select Patient --</option>
                  {emergency.length > 0 && (
                    <optgroup label="🚨 Emergency Patients">
                      {emergency.map(renderOpt)}
                    </optgroup>
                  )}
                  {inQueue.length > 0 && (
                    <optgroup label="⏳ In Queue">
                      {inQueue.map(renderOpt)}
                    </optgroup>
                  )}
                  {normal.length > 0 && (
                    <optgroup label="👥 Regular Patients">
                      {normal.map(renderOpt)}
                    </optgroup>
                  )}
                </select>
              );
            })()}
            {errors.patient && <p className="text-red-500 text-sm mt-1">{errors.patient}</p>}
          </div>
        </div>
      )}

      {/* Error / Success */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}
      {errors.success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-md">
          <p className="text-green-700 text-sm font-medium">{errors.success}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
          <div className="grid grid-cols-1 gap-2">
            {paymentMethods.map((method) => (
              <div
                key={method.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentData.payment_method === method.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
          />
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
        </div>

        {renderPaymentFields()}

        {/* Emergency Surcharge Notice */}
        {emergencySurcharge > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 font-medium">
              🚨 Emergency Patient Surcharge (20%): +₹{emergencySurcharge.toFixed(2)}
            </p>
          </div>
        )}

        {/* Processing Fee */}
        {processingFee > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              ⚠️ Online Processing Fee (1.8%): +₹{processingFee.toFixed(2)}
            </p>
          </div>
        )}

        {/* Payment Summary */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total to Pay:</span>
            <span className="text-xl font-bold text-blue-600">₹{totalToPay.toFixed(2)}</span>
          </div>
          {(processingFee > 0 || emergencySurcharge > 0) && (
            <div className="text-xs text-gray-600 mt-2 space-y-0.5">
              <div className="flex justify-between"><span>Base Amount:</span><span>₹{parseFloat(paymentData.amount).toFixed(2)}</span></div>
              {emergencySurcharge > 0 && <div className="flex justify-between text-red-600"><span>Emergency Surcharge:</span><span>+₹{emergencySurcharge.toFixed(2)}</span></div>}
              {processingFee > 0 && <div className="flex justify-between text-yellow-600"><span>Processing Fee:</span><span>+₹{processingFee.toFixed(2)}</span></div>}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={() => processPayment()}
            disabled={loading || !!errors.success}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay ₹${totalToPay.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealPaymentForm;