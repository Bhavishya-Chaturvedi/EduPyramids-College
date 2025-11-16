
# Register your models here.
from django.contrib import admin
from .models import HDFCTransactionDetails, AcademicSubscription, PayeeHdfcTransaction

@admin.register(HDFCTransactionDetails)
class HDFCTransactionAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'transaction_id', 'order_status', 'amount', 'date_created')

@admin.register(AcademicSubscription)
class AcademicSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'academic_id', 'amount', 'expiry_date')

@admin.register(PayeeHdfcTransaction)
class PayeeHdfcTransactionAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'transaction_id', 'order_status', 'amount')
