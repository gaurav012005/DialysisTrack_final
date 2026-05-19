"""
Patient Dashboard API Views
Provides endpoints for patient portal features including:
- Dashboard overview
- Appointments management
- Session history
- Bills and payments
- Document downloads (receipts, session summaries)
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q, Sum, Count, F

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO

from patients.models import Patient
from appointments.models import Appointment
from dialysis_queue.models import Queue, DialysisSession
from billing.models import Bill, Payment


class PatientDashboardViewSet(viewsets.ViewSet):
    """
    Patient Portal Dashboard ViewSet
    Provides comprehensive patient-facing features
    """
    permission_classes = [IsAuthenticated]
    
    def _get_patient(self, request):
        """Get patient object for current user"""
        try:
            if request.user.role == 'patient':
                if hasattr(request.user, 'patient_profile'):
                    return request.user.patient_profile
                elif hasattr(request.user, 'patient'):
                    return request.user.patient
            return None
        except:
            return None
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """
        Get patient dashboard overview
        Returns: upcoming appointments, pending bills, recent sessions, stats
        """
        patient = self._get_patient(request)
        if not patient:
            # Return empty structure if patient profile doesn't exist yet
            return Response({
                'patient_info': {'name': request.user.get_full_name() or request.user.username},
                'upcoming_appointments': [],
                'pending_bills': [],
                'recent_sessions': [],
                'statistics': {'total_sessions': 0, 'total_paid': 0.0, 'pending_amount': 0.0, 'next_appointment': None}
            }, status=status.HTTP_200_OK)
        
        # Upcoming appointments (next 30 days)
        upcoming_appointments = Appointment.objects.filter(
            patient=patient,
            appointment_date__gte=timezone.now().date(),
            appointment_date__lte=timezone.now().date() + timedelta(days=30),
            status__in=['scheduled', 'confirmed']
        ).order_by('appointment_date', 'scheduled_time')[:5]
        
        # Pending bills
        pending_bills = Bill.objects.filter(
            patient=patient,
            total_amount__gt=F('paid_amount')
        ).order_by('-created_at')[:5]
        
        # Recent sessions (last 10)
        recent_sessions = DialysisSession.objects.filter(
            patient=patient
        ).order_by('-created_at')[:10]
        
        # Statistics
        total_sessions = DialysisSession.objects.filter(patient=patient).count()
        total_paid = Payment.objects.filter(
            bill__patient=patient
        ).aggregate(total=Sum('amount'))['total'] or 0
        pending_amount = Bill.objects.filter(
            patient=patient
        ).aggregate(total=Sum(F('total_amount') - F('paid_amount')))['total'] or 0
        
        # Build response
        data = {
            'patient_info': {
                'id': patient.id,
                'name': patient.name,
                'patient_id': patient.patient_id,
                'email': patient.email,
                'phone': patient.phone_number,
                'blood_type': patient.blood_type,
                'emergency': patient.is_emergency,
            },
            'upcoming_appointments': [
                {
                    'id': apt.id,
                    'date': apt.appointment_date,
                    'shift': apt.shift,
                    'scheduled_time': apt.scheduled_time,
                    'status': apt.status,
                    'notes': apt.notes,
                } for apt in upcoming_appointments
            ],
            'pending_bills': [
                {
                    'id': bill.id,
                    'bill_number': bill.bill_number,
                    'date': bill.bill_date if hasattr(bill, 'bill_date') else bill.created_at.date(),
                    'total_amount': float(bill.total_amount),
                    'paid_amount': float(bill.paid_amount),
                    'balance_amount': float(bill.total_amount - bill.paid_amount),
                    'due_date': bill.due_date if hasattr(bill, 'due_date') else bill.created_at.date() + timedelta(days=30),
                } for bill in pending_bills
            ],
            'recent_sessions': [
                {
                    'id': session.id,
                    'date': session.created_at.date(),
                    'duration': session.queue.total_session_time if session.queue else None,
                    'pre_weight': session.queue.weight_before if session.queue else None,
                    'post_weight': session.queue.weight_after if session.queue else None,
                    'complications': session.complications,
                } for session in recent_sessions
            ],
            'statistics': {
                'total_sessions': total_sessions,
                'total_paid': float(total_paid),
                'pending_amount': float(pending_amount),
                'next_appointment': upcoming_appointments.first().appointment_date if upcoming_appointments.exists() else None,
            }
        }
        
        return Response(data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def appointments(self, request):
        """
        Get all patient appointments
        Query params: status, date_from, date_to
        """
        patient = self._get_patient(request)
        if not patient:
            return Response([], status=status.HTTP_200_OK)
        
        appointments = Appointment.objects.filter(patient=patient)
        
        # Filters
        status_filter = request.query_params.get('status')
        if status_filter:
            appointments = appointments.filter(status=status_filter)
        
        date_from = request.query_params.get('date_from')
        if date_from:
            appointments = appointments.filter(appointment_date__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            appointments = appointments.filter(appointment_date__lte=date_to)
        
        appointments = appointments.order_by('-appointment_date')
        
        data = [
            {
                'id': apt.id,
                'date': apt.appointment_date,
                'shift': apt.shift,
                'scheduled_time': apt.scheduled_time,
                'status': apt.status,
                'notes': apt.notes,
                'created_at': apt.created_at,
            } for apt in appointments
        ]
        
        return Response(data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def sessions(self, request):
        """
        Get all patient dialysis sessions
        Query params: date_from, date_to
        """
        patient = self._get_patient(request)
        if not patient:
            return Response([], status=status.HTTP_200_OK)
        
        sessions = DialysisSession.objects.filter(patient=patient)
        
        # Filters
        date_from = request.query_params.get('date_from')
        if date_from:
            sessions = sessions.filter(created_at__date__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            sessions = sessions.filter(created_at__date__lte=date_to)
        
        sessions = sessions.order_by('-created_at')
        
        data = [
            {
                'id': session.id,
                'date': session.created_at.date(),
                'time': session.created_at.time(),
                'duration_minutes': session.queue.total_session_time if session.queue else None,
                'machine_number': session.queue.assigned_machine if session.queue else None,
                'pre_dialysis_weight': session.queue.weight_before if session.queue else None,
                'post_dialysis_weight': session.queue.weight_after if session.queue else None,
                'pre_bp_systolic': session.pre_bp_systolic,
                'pre_bp_diastolic': session.pre_bp_diastolic,
                'post_bp_systolic': session.post_bp_systolic,
                'post_bp_diastolic': session.post_bp_diastolic,
                'ultrafiltration_volume': session.ultrafiltration_volume,
                'complications': session.complications,
                'notes': session.nurse_notes or session.doctor_notes,
            } for session in sessions
        ]
        
        return Response(data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def bills(self, request):
        """
        Get all patient bills
        Query params: status (paid/unpaid/partial)
        """
        patient = self._get_patient(request)
        if not patient:
            return Response([], status=status.HTTP_200_OK)
        
        bills = Bill.objects.filter(patient=patient)
        
        # Filter by payment status
        payment_status = request.query_params.get('status')
        if payment_status == 'paid':
            bills = bills.filter(total_amount=F('paid_amount'))
        elif payment_status == 'unpaid':
            bills = bills.filter(paid_amount=0, total_amount__gt=0)
        elif payment_status == 'partial':
            bills = bills.filter(paid_amount__gt=0, total_amount__gt=F('paid_amount'))
        
        bills = bills.order_by('-created_at')
        
        data = [
            {
                'id': bill.id,
                'bill_number': bill.bill_number,
                'bill_date': bill.created_at.date(),
                'session_cost': float(bill.session_cost),
                'medicines_cost': float(bill.medicine_cost),
                'consultation_fee': float(bill.consultation_cost),
                'other_charges': float(bill.other_charges),
                'subtotal': float(bill.subtotal),
                'gst_amount': float(bill.tax_amount),
                'discount': float(bill.discount),
                'total_amount': float(bill.total_amount),
                'paid_amount': float(bill.paid_amount),
                'balance_amount': float(bill.total_amount - bill.paid_amount),
                'payment_status': bill.status,
                'payments': [
                    {
                        'id': payment.id,
                        'amount': float(payment.amount),
                        'payment_mode': payment.payment_method,
                        'payment_date': payment.payment_date,
                        'transaction_id': payment.transaction_id,
                    } for payment in bill.payments.all()
                ]
            } for bill in bills
        ]
        
        return Response(data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='download-session-summary')
    def download_session_summary(self, request, pk=None):
        """
        Download session summary PDF for a specific session
        """
        patient = self._get_patient(request)
        if not patient:
            return Response(
                {'error': 'Patient profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            session = DialysisSession.objects.get(id=pk, patient=patient)
        except DialysisSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        story.append(Paragraph("Dialysis Session Summary", title_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Patient Info
        patient_data = [
            ['Patient Name:', patient.get_full_name()],
            ['Patient ID:', patient.patient_id],
            ['Session Date:', session.created_at.strftime('%d-%b-%Y %I:%M %p')],
            ['Session ID:', f'#{session.id}'],
        ]
        
        patient_table = Table(patient_data, colWidths=[2*inch, 4*inch])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        story.append(patient_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Session Details
        story.append(Paragraph("Session Details", styles['Heading2']))
        story.append(Spacer(1, 0.1*inch))
        
        session_data = [
            ['Parameter', 'Pre-Dialysis', 'Post-Dialysis'],
            ['Weight (kg)', f"{session.queue.weight_before or 'N/A'}", f"{session.queue.weight_after or 'N/A'}"],
            ['BP (mmHg)', f"{session.pre_bp_systolic or 'N/A'}/{session.pre_bp_diastolic or 'N/A'}", 
             f"{session.post_bp_systolic or 'N/A'}/{session.post_bp_diastolic or 'N/A'}"],
            ['Heart Rate (bpm)', f"{session.pre_heart_rate or 'N/A'}", f"{session.post_heart_rate or 'N/A'}"],
            ['Temperature (°F)', f"{session.pre_temperature or 'N/A'}", f"{session.post_temperature or 'N/A'}"],
        ]
        
        session_table = Table(session_data, colWidths=[2*inch, 2*inch, 2*inch])
        session_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(session_table)
        story.append(Spacer(1, 0.2*inch))
        
        # Dialysis Parameters
        dialysis_data = [
            ['Duration:', f"{session.queue.total_session_time or 'N/A'} minutes" if session.queue else 'N/A'],
            ['UF Volume:', f"{session.ultrafiltration_volume or 'N/A'} L"],
            ['Machine:', session.queue.assigned_machine if session.queue else 'N/A'],
        ]
        
        dialysis_table = Table(dialysis_data, colWidths=[2*inch, 4*inch])
        dialysis_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(dialysis_table)
        story.append(Spacer(1, 0.2*inch))
        
        # Complications & Notes
        notes = session.nurse_notes or session.doctor_notes
        if session.complications or notes:
            story.append(Paragraph("Additional Information", styles['Heading2']))
            story.append(Spacer(1, 0.1*inch))
            
            if session.complications:
                story.append(Paragraph(f"<b>Complications:</b> {session.complications}", styles['Normal']))
                story.append(Spacer(1, 0.1*inch))
            
            if notes:
                story.append(Paragraph(f"<b>Notes:</b> {notes}", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Return PDF response
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="session_summary_{session.id}.pdf"'
        return response
    
    @action(detail=True, methods=['get'], url_path='download-receipt')
    def download_receipt(self, request, pk=None):
        """
        Download payment receipt PDF for a specific bill
        """
        patient = self._get_patient(request)
        if not patient:
            return Response(
                {'error': 'Patient profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            bill = Bill.objects.get(id=pk, patient=patient)
        except Bill.DoesNotExist:
            return Response(
                {'error': 'Bill not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        styles = getSampleStyleSheet()
        
        # Header
        header_style = ParagraphStyle(
            'CustomHeader',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#059669'),
            spaceAfter=10,
            alignment=TA_CENTER
        )
        story.append(Paragraph("PAYMENT RECEIPT", header_style))
        story.append(Paragraph("DialysisTrack Center", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Bill Info
        bill_info = [
            ['Receipt #:', bill.bill_number],
            ['Date:', bill.bill_date.strftime('%d-%b-%Y')],
            ['Patient:', patient.get_full_name()],
            ['Patient ID:', patient.patient_id],
        ]
        
        bill_table = Table(bill_info, colWidths=[2*inch, 4*inch])
        bill_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(bill_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Charges Breakdown
        story.append(Paragraph("Charges Breakdown", styles['Heading2']))
        story.append(Spacer(1, 0.1*inch))
        
        charges_data = [
            ['Description', 'Amount (₹)'],
            ['Session Cost', f"{bill.session_cost:.2f}"],
            ['Medicines', f"{bill.medicines_cost:.2f}"],
            ['Consultation Fee', f"{bill.consultation_fee:.2f}"],
            ['Other Charges', f"{bill.other_charges:.2f}"],
            ['', ''],
            ['Subtotal', f"{bill.subtotal:.2f}"],
            ['GST (18%)', f"{bill.gst_amount:.2f}"],
            ['Discount', f"- {bill.discount:.2f}"],
            ['', ''],
            ['TOTAL AMOUNT', f"₹ {bill.total_amount:.2f}"],
        ]
        
        charges_table = Table(charges_data, colWidths=[4*inch, 2*inch])
        charges_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.whitesmoke),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('LINEABOVE', (0, -2), (-1, -2), 2, colors.black),
            ('GRID', (0, 0), (-1, -3), 1, colors.grey),
        ]))
        story.append(charges_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Payment Details
        story.append(Paragraph("Payment History", styles['Heading2']))
        story.append(Spacer(1, 0.1*inch))
        
        payments = bill.payments.all().order_by('payment_date')
        
        if payments:
            payment_data = [['Date', 'Mode', 'Amount (₹)', 'Transaction ID']]
            
            for payment in payments:
                payment_data.append([
                    payment.payment_date.strftime('%d-%b-%Y'),
                    payment.payment_mode.upper(),
                    f"{payment.amount:.2f}",
                    payment.transaction_id or 'N/A'
                ])
            
            payment_table = Table(payment_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            payment_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(payment_table)
            story.append(Spacer(1, 0.2*inch))
        
        # Summary
        summary_data = [
            ['Total Amount:', f"₹ {bill.total_amount:.2f}"],
            ['Paid Amount:', f"₹ {bill.paid_amount:.2f}"],
            ['Balance Due:', f"₹ {bill.balance_amount:.2f}"],
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('LINEABOVE', (0, 0), (-1, 0), 2, colors.black),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(summary_table)
        
        # Footer
        story.append(Spacer(1, 0.5*inch))
        footer_text = f"<i>Generated on: {timezone.now().strftime('%d-%b-%Y %I:%M %p')}</i>"
        story.append(Paragraph(footer_text, styles['Normal']))
        story.append(Paragraph("<i>Thank you for choosing DialysisTrack!</i>", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Return PDF response
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="receipt_{bill.bill_number}.pdf"'
        return response
