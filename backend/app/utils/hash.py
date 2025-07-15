import os
import hashlib


def generate_hash() -> str:
    '''
    Generate a SHA-256 hash of the input string.

    Args:
        input_string (str): The string to hash.

    Returns:
        str: The hexadecimal representation of the hash.
    '''
    random_bytes = os.urandom(16)  # Generate 16 random bytes
    return hashlib.sha256(random_bytes).hexdigest()
