from rest_framework import serializers
from .models import HDFCTransactionDetails, AcademicSubscription

class HDFCTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HDFCTransactionDetails
        fields = '__all__'

class AcademicSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSubscription
        fields = '__all__'
