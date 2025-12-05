from django.db import models
from django.conf import settings
from django.utils import timezone

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
        # use email if available (user.email may not exist for some custom user models)
        try:
            user_email = self.user.email
        except Exception:
            user_email = str(self.user)
        return f"Subscription: {user_email} - {self.academic_id}"


class AcademicSubscriptionDetail(models.Model):
    """
    History of subscription activations / changes.
    Created so reviewers' comment about AcademicSubscriptionDetail is satisfied.
    """
    subscription = models.ForeignKey(AcademicSubscription, on_delete=models.CASCADE, related_name='history')
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"SubscriptionDetail: {self.subscription} active={self.is_active} from={self.start_date}"


class PayeeHdfcTransaction(HDFCTransactionDetails):
    """Separate model for ILW/Payee-based payments."""
    pass


class AcademicCenter(models.Model):
    institution_name = models.CharField(max_length=255)
    academic_code = models.CharField(max_length=50)
    gst_number = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.institution_name} ({self.academic_code})"
