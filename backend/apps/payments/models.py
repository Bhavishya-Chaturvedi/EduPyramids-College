from django.db import models
from django.conf import settings

class HDFCTransactionDetails(models.Model):
    transaction_id = models.CharField(max_length=100)
    order_id = models.CharField(max_length=50)
    requestId = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_status = models.CharField(max_length=50, null=True, blank=True)
    udf1 = models.TextField(null=True, blank=True)
    udf2 = models.TextField(null=True, blank=True)
    udf3 = models.TextField(null=True, blank=True)
    udf4 = models.TextField(null=True, blank=True)
    udf5 = models.TextField(null=True, blank=True)
    customer_email = models.EmailField(null=True, blank=True)
    customer_phone = models.CharField(max_length=20, null=True, blank=True)
    error_code = models.CharField(max_length=50, null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"HDFC Transaction {self.order_id}"


class AcademicSubscription(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    academic_id = models.CharField(max_length=100, null=True, blank=True)  # Store academic center ID
    transaction = models.ForeignKey(HDFCTransactionDetails, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateField()

    def __str__(self):
        return f"Subscription: {self.user.email} - {self.academic_id}"


class PayeeHdfcTransaction(HDFCTransactionDetails):
    """Separate model for ILW/Payee-based payments."""
    pass

class AcademicCenter(models.Model):
    institution_name = models.CharField(max_length=255)
    academic_code = models.CharField(max_length=50)
    gst_number = models.CharField(max_length=20, null=True, blank=True)
