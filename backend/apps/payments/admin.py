from django.contrib import admin
from .models import HDFCTransactionDetails, AcademicSubscription, PayeeHdfcTransaction, AcademicSubscriptionDetail

@admin.register(HDFCTransactionDetails)
class HDFCTransactionAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'transaction_id', 'order_status', 'amount', 'date_created')
    search_fields = ('order_id', 'transaction_id', 'customer_email')


@admin.register(AcademicSubscription)
class AcademicSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'academic_id', 'amount', 'expiry_date')
    search_fields = ('user__email', 'academic_id')


@admin.register(PayeeHdfcTransaction)
class PayeeHdfcTransactionAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'transaction_id', 'order_status', 'amount')


@admin.register(AcademicSubscriptionDetail)
class AcademicSubscriptionDetailAdmin(admin.ModelAdmin):
    list_display = ('subscription', 'start_date', 'end_date', 'is_active', 'created_at')
    search_fields = ('subscription__user__email', 'subscription__academic_id')
