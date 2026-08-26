import bcrypt


def hash_password(password):
    # Use rounds=10 for high security + fast hashing execution (~30ms)
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")


def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
