from rest_framework import serializers
from .models import Bill, Payment, InsuranceProvider, PatientInsurance

class BillSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    balance_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Bill
        fields = '__all__'
        read_only_fields = ('bill_number', 'subtotal', 'tax_amount', 'total_amount', 'paid_amount')
    
    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
    
    def get_balance_amount(self, obj):
        return obj.total_amount - obj.paid_amount

class PaymentSerializer(serializers.ModelSerializer):
    bill_number = serializers.CharField(source='bill.bill_number', read_only=True)
    patient_name = serializers.CharField(source='bill.patient.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('payment_id',)

class InsuranceProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceProvider
        fields = '__all__'

class PatientInsuranceSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    
    class Meta:
        model = PatientInsurance
        fields = '__all__'

class PaymentCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating payments"""
    
    class Meta:
        model = Payment
        fields = ['bill', 'amount', 'payment_method', 'transaction_id', 'reference_number', 
                 'bank_name', 'upi_id', 'notes']
    
    def create(self, validated_data):
        validated_data['processed_by'] = self.context['request'].user
        validated_data['status'] = 'completed'  # Auto-complete for now
        return super().create(validated_data)