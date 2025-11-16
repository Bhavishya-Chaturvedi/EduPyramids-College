from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.urls import reverse
from django.http import JsonResponse
from .models import AcademicSubscription, HDFCTransactionDetails, PayeeHdfcTransaction
from .serializers import HDFCTransactionSerializer
from .utils.hdfc_utils import generate_hashed_order_id, get_request_headers, poll_payment_status
from decimal import Decimal
import requests

@api_view(['POST'])
def create_academic_payment_session(request):
    """Creates payment session for academic subscription"""
    data = request.data
    email = data.get('email')
    academic_ids = data.get('academic_ids', [])
    amount = data.get('amount')

    payload = {
        "order_id": generate_hashed_order_id(email),
        "amount": str(amount),
        "customer_id": email,
        "customer_email": email,
        "customer_phone": data.get("phone"),
        "payment_page_client_id": "your_client_id_here",
        "action": "paymentPage",
        "return_url": request.build_absolute_uri(reverse('payment-callback')),
        "description": "Complete Academic Subscription Payment...",
        "udf3": data.get('name'),
        "udf4": data.get('state')
    }

    # AcademicCenter lookup removed - module 'events' not available
    # values = AcademicCenter.objects.filter(id__in=academic_ids).values('institution_name', 'academic_code')
    # payload["udf1"] = ' ** '.join([v['institution_name'] for v in values])[:90]
    # payload["udf2"] = ' ** '.join([v['academic_code'] for v in values])

    headers = get_request_headers(email)
    try:
        response = requests.post(settings.HDFC_API_URL, json=payload, headers=headers)
        response_data = response.json()
        if response.status_code == 200:
            transaction = HDFCTransactionDetails.objects.create(
                transaction_id=response_data.get("id"),
                order_id=response_data.get("order_id"),
                amount=amount
            )
            return Response({"payment_link": response_data.get("payment_links", {}).get("web")})
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
