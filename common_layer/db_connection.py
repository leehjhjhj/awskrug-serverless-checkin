import boto3
import time
from sqlalchemy import create_engine, Engine
from sqlalchemy.engine.url import URL
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from settings import settings

_engine = None
_SessionLocal = None
_token_cache = None
_token_expiry = None

def get_dsql_engine_and_session() -> tuple[Engine, Session]:
    global _engine, _SessionLocal, _token_cache, _token_expiry

    now = time.time()
    if _token_cache is None or _token_expiry is None or now >= _token_expiry:
        client = boto3.client('dsql', region_name=settings.region)
        _token_cache = client.generate_db_connect_admin_auth_token(
            settings.cluster_endpoint,
            settings.region
        )
        _token_expiry = now + 900

    # Engine 재사용 (처음 한 번만 생성)
    if _engine is None:
        url = URL.create(
            "auroradsql+psycopg",
            username=settings.db_user,
            host=settings.cluster_endpoint,
            password=_token_cache,
            database=settings.db_name
        )

        _engine = create_engine(
            url,
            connect_args={
                "sslmode": "require",
                "sslrootcert": "none"
            },
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=840
        )
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

    return _engine, _SessionLocal()

@contextmanager
def get_session():
    _, session = get_dsql_engine_and_session()
    try:
        yield session
    finally:
        session.close()