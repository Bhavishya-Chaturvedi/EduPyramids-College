from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.http import JsonResponse
from .models import AcademicSubscription, HDFCTransactionDetails, PayeeHdfcTransaction, AcademicCenter, AcademicSubscriptionDetail
from .serializers import HDFCTransactionSerializer
from .utils.hdfc_utils import generate_hashed_order_id, get_request_headers, poll_payment_status
from decimal import Decimal
import requests
from django.shortcuts import redirect
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
def create_academic_payment_session(request):
    """Creates payment session for academic subscription"""
    data = request.data
    email = data.get('email')
    academic_ids = data.get('academic_ids', [])
    amount = data.get('amount')
    gst_json = data.get('gst_json', '')  # GST data as JSON string

    payload = {
        "order_id": generate_hashed_order_id(email),
        "amount": str(amount),
        "customer_id": email,
        "customer_email": email,
        "customer_phone": data.get("phone"),
        "payment_page_client_id": "your_client_id_here",
        "action": "paymentPage",
        "return_url": request.build_absolute_uri("/api/payments/callback-handler/"),
        "description": "Complete Academic Subscription Payment...",
        "udf3": data.get('name'),
        "udf4": data.get('state'),
        "udf5": gst_json,  # GST data for HDFC
    }

<<<<<<< HEAD
    # AcademicCenter lookup removed - module 'events' not available
=======
    #AcademicCenter lookup removed - module 'events' not available
>>>>>>> 70ebc1e (AcademicSubscriptionDetail/payment_callback)
    values = AcademicCenter.objects.filter(id__in=academic_ids).values('institution_name', 'academic_code')
    payload["udf1"] = ' ** '.join([v['institution_name'] for v in values])[:90]
    payload["udf2"] = ' ** '.join([v['academic_code'] for v in values])

    headers = get_request_headers(email)
    try:
        response = requests.post(settings.HDFC_API_URL, json=payload, headers=headers)
        response_data = response.json()
        if response.status_code == 200:
            transaction_id = response_data.get("id")
            request_id = response_data.get("requestId")
            
            transaction = HDFCTransactionDetails.objects.create(
                transaction_id=transaction_id,
                order_id=response_data.get("order_id"),
                requestId=request_id,
                amount=amount,
                customer_email=email,
                customer_phone=data.get("phone"),
                udf3=data.get('name'),
                udf4=data.get('state'),
                udf5=gst_json,  # Store GST data in database
            )
            
            return Response({
                "payment_link": response_data.get("payment_links", {}).get("web"),
                "transaction_id": transaction_id
            })
        else:
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def check_payment_status(request, order_id):
    """Polls the payment gateway for order status"""
    email = request.query_params.get("email")
    amount = request.query_params.get("amount")
    result = poll_payment_status(order_id, email, Decimal(amount))
    return Response(result)


@api_view(['GET'])
def get_transaction_details(request, transaction_id):
    """Fetch transaction details by transaction_id"""
    try:
        transaction = HDFCTransactionDetails.objects.get(transaction_id=transaction_id)
        serializer = HDFCTransactionSerializer(transaction)
        return Response(serializer.data)
    except HDFCTransactionDetails.DoesNotExist:
        return Response(
            {"error": "Transaction not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def payment_callback(request):
    """
    Endpoint called by HDFC (or client) to post payment result.
    - Verifies HMAC/signature when present
    - Updates HDFCTransactionDetails record
    - On success (CHARGED), attempt to create AcademicSubscription & AcademicSubscriptionDetail
    """
    raw = request.data or {}
    # Prepare params in the form expected by verify_hmac_signature:
    # the util expects values as lists (signature access uses [0]), so convert single values -> list
    params_for_verify = {k: (v if isinstance(v, list) else [v]) for k, v in raw.items()}

    # signature verification (if signature present in payload). If verification fails, we still log but mark transaction.
    signature_ok = True
    try:
        if 'signature' in params_for_verify:
            signature_ok = verify_hmac_signature(params_for_verify)
    except Exception:
        signature_ok = False

    # Extract identifying fields - HDFC may send transaction id, order id or requestId
    transaction_id = raw.get('transaction_id') or raw.get('id') or raw.get('txnId') or raw.get('txn_id') or raw.get('transactionId')
    order_id = raw.get('order_id') or raw.get('orderId') or raw.get('orderid')
    request_id = raw.get('requestId') or raw.get('request_id')

    amount = raw.get('amount') or raw.get('txn_amount') or raw.get('amount_paid') or raw.get('txAmount')
    status_field = raw.get('status') or raw.get('order_status') or raw.get('orderStatus') or raw.get('statusCode')

    # Try to find existing transaction record by order_id or transaction_id or requestId
    transaction = None
    try:
        if order_id:
            transaction = HDFCTransactionDetails.objects.filter(order_id=order_id).first()
        if not transaction and transaction_id:
            transaction = HDFCTransactionDetails.objects.filter(transaction_id=transaction_id).first()
        if not transaction and request_id:
            transaction = HDFCTransactionDetails.objects.filter(requestId=request_id).first()
    except Exception as e:
        # unexpected DB issue; return 500
        return Response({"error": "db_error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # If no transaction found, create a minimal record (so we have a DB row to inspect)
    if not transaction:
        try:
            transaction = HDFCTransactionDetails.objects.create(
                transaction_id=transaction_id or generate_hashed_order_id("unknown"),
                order_id=order_id or f"ORDER_{timezone.now().timestamp()}",
                requestId=request_id,
                amount=Decimal(amount) if amount else Decimal("0.00"),
                order_status=status_field or ("UNKNOWN" if not signature_ok else "PENDING"),
                customer_email=raw.get('customer_email') or raw.get('email'),
                customer_phone=raw.get('customer_phone') or raw.get('phone'),
                udf1=raw.get('udf1'),
                udf2=raw.get('udf2'),
                udf3=raw.get('udf3'),
                udf4=raw.get('udf4'),
                udf5=raw.get('udf5'),
                error_message=None if signature_ok else "signature_verification_failed",
            )
        except Exception as e:
            return Response({"error": "create_transaction_failed", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Update transaction details from payload where present
    try:
        if amount:
            # safe cast
            try:
                transaction.amount = Decimal(str(amount))
            except Exception:
                pass
        if status_field:
            transaction.order_status = status_field
        if raw.get('error_code'):
            transaction.error_code = raw.get('error_code')
        if raw.get('error_message'):
            transaction.error_message = raw.get('error_message')
        # update customer fields
        transaction.customer_email = raw.get('customer_email') or raw.get('email') or transaction.customer_email
        transaction.customer_phone = raw.get('customer_phone') or raw.get('phone') or transaction.customer_phone
        # store requestId if provided
        if request_id:
            transaction.requestId = request_id
        transaction.save()
    except Exception as e:
        return Response({"error": "update_failed", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # If payment successful, attempt to create subscription record(s)
    # Common HDFC success state name used in your utils: 'CHARGED'
    success_states = {"CHARGED", "SUCCESS", "COMPLETED", "OK"}
    if str(transaction.order_status).upper() in success_states:
        # parse academic id(s) from udf2 or udf1 or custom field. Adjust as per your payload contract
        academic_id = None
        # udf2 in create_academic_payment_session was academic_code joined
        if transaction.udf2:
            academic_id = transaction.udf2.split(' ** ')[0] if isinstance(transaction.udf2, str) else transaction.udf2

        user = None
        email = transaction.customer_email
        if email:
            try:
                user = User.objects.filter(email__iexact=email).first()
            except Exception:
                user = None

        # Only create a subscription if we can find a user (db integrity requires user)
        if user:
            try:
                # expiry: default 1 year from now if not provided in any payload
                expiry_date = None
                if raw.get('expiry_date'):
                    expiry_date = raw.get('expiry_date')
                else:
                    expiry_date = (timezone.now().date().replace(day=1) + timezone.timedelta(days=365))

                # Create or update subscription; simplistic approach: always create a new subscription row
                subscription = AcademicSubscription.objects.create(
                    user=user,
                    academic_id=academic_id,
                    transaction=transaction,
                    phone=transaction.customer_phone or "",
                    amount=transaction.amount or Decimal('0.00'),
                    expiry_date=expiry_date
                )

                # Add a subscription detail / history record
                AcademicSubscriptionDetail.objects.create(
                    subscription=subscription,
                    start_date=timezone.now().date(),
                    end_date=subscription.expiry_date,
                    is_active=True,
                    note=f"Created from HDFC callback. txn={transaction.transaction_id}"
                )
            except Exception as e:
                # don't fail the whole callback if subscription creation fails; log the error in transaction
                transaction.error_message = (transaction.error_message or "") + f" | subscription_creation_failed: {str(e)}"
                transaction.save()

    # Successful receipt acknowledgement for gateway
    return Response({"status": "received", "verified": signature_ok})


@api_view(['GET', 'POST'])
def callback_handler(request):
    """Handle HDFC callback and redirect to frontend payment status page"""
    # Try to get transaction ID from various sources
    transaction_id = (
        request.GET.get('id') or 
        request.GET.get('transaction_id') or
        request.GET.get('txnId') or
        request.GET.get('requestId')
    )
    
    # Also try order_id which HDFC might send
    order_id = (
        request.GET.get('order_id') or
        request.GET.get('orderId') or
        request.POST.get('order_id') or
        request.POST.get('orderId')
    )
    
    # If we have order_id, look up the transaction
    if order_id and not transaction_id:
        try:
            transaction = HDFCTransactionDetails.objects.get(order_id=order_id)
            transaction_id = transaction.transaction_id
        except HDFCTransactionDetails.DoesNotExist:
            pass
    
    if not transaction_id:
        # Fallback: redirect to subscription page with error
        return redirect("http://localhost:5173/subscription?error=payment_callback_missing_id")
    
    # Redirect to frontend payment status page
    frontend_url = f"http://localhost:5173/payment-status/{transaction_id}"
    return redirect(frontend_url)
