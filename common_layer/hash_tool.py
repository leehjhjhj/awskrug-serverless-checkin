from settings import settings
import hashlib

def hash_phone_number(phone: str) -> str:
    phone_str = str(phone)
    clean_phone = ''.join(filter(str.isdigit, phone_str))
    salt = settings.salt
    hash_input = (clean_phone + salt).encode('utf-8')
    return hashlib.sha256(hash_input).hexdigest()