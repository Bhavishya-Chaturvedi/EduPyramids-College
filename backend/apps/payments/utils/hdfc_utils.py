import hashlib
import time
import base64
import hmac
import urllib.parse
import json
import requests as http_requests
from django.conf import settings
from ..models import HDFCTransactionDetails

def generate_hashed_order_id(email):
    data = f"{email}{int(time.time())}"
    return hashlib.sha256(data.encode()).hexdigest()[:15].upper()

def get_request_headers(email):
    encoded_api_key = base64.b64encode(f"{settings.HDFC_API_KEY}:".encode()).decode()
    return {
        "Authorization": f"Basic {encoded_api_key}",
        "Content-Type": "application/json",
        "x-merchantid": settings.MERCHANT_ID,
        "x-customerid": email
    }

def verify_hmac_signature(params):
    key = settings.RESPONSE_KEY.encode()
    data = params.copy()
    signature_algorithm = data.pop('signature_algorithm', None)
    signature = data.pop('signature', [None])[0]
    if not signature:
        return False

    encoded_params = {
        urllib.parse.quote_plus(str(k)): urllib.parse.quote_plus(str(v))
        for k, v in data.items()
    }
    encoded_string = '&'.join(f"{k}={encoded_params[k]}" for k in sorted(encoded_params))
    p_encoded_string = urllib.parse.quote_plus(encoded_string)
    dig = hmac.new(key, msg=p_encoded_string.encode(), digestmod=hashlib.sha256).digest()
    computed_sign = base64.b64encode(dig).decode()
    return computed_sign == signature

def poll_payment_status(order_id, email, sub_amount, model=HDFCTransactionDetails):
    url = f"{settings.ORDER_STATUS_URL}{order_id}"
    headers = get_request_headers(email)
    attempt = 0
    while attempt < settings.HDFC_POLL_MAX_RETRIES:
        try:
            response = http_requests.get(url, headers=headers)
            data = response.json()
            if response.status_code == 200 and "status" in data:
                payment_status = data.get('status', '')
                if payment_status == 'CHARGED':
                    obj = model.objects.get(order_id=order_id)
                    obj.order_status = 'CHARGED'
                    obj.save()
                    return {"status": "CHARGED"}
                elif payment_status in ["AUTHENTICATION_FAILED", "AUTHORIZATION_FAILED"]:
                    return {"status": "FAILED"}
        except Exception as e:
            return {"status": "ERROR", "message": str(e)}
        time.sleep(settings.HDFC_POLL_INTERVAL)
        attempt += 1
    return {"status": "TIMEOUT"}


def create_hdfc_session(payload, headers):
    return http_requests.post(settings.HDFC_API_URL, json=payload, headers=headers)

