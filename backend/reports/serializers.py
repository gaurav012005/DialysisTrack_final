from rest_framework import serializers

class ReportRequestSerializer(serializers.Serializer):
    report_type = serializers.CharField(required=True)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    format = serializers.ChoiceField(choices=['json', 'csv', 'pdf'], default='json')

class DashboardStatsSerializer(serializers.Serializer):
    patients = serializers.DictField()
    queue = serializers.DictField()
    machines = serializers.DictField()
    appointments = serializers.DictField()
    date = serializers.DateField()