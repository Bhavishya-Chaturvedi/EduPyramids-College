from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.http import JsonResponse
from .models import AcademicSubscription, HDFCTransactionDetails, PayeeHdfcTransaction, AcademicCenter
from .serializers import HDFCTransactionSerializer
from .utils.hdfc_utils import generate_hashed_order_id, get_request_headers, poll_payment_status
from decimal import Decimal
import requests
from django.shortcuts import redirect

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

    # AcademicCenter lookup removed - module 'events' not available
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
    data = request.data
    
    # validate checksum here
    # verify amount/order_id
    # update transaction model

    return Response({"status": "received"})


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
