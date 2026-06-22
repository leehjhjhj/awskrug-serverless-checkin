import boto3
from sqlalchemy import create_engine, event, Engine
from sqlalchemy.engine.url import URL
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from settings import settings

_engine = None
_SessionLocal = None
_dsql_client = None


def _get_dsql_client():
    global _dsql_client
    if _dsql_client is None:
        _dsql_client = boto3.client('dsql', region_name=settings.region)
    return _dsql_client


def _generate_token() -> str:
    """매 호출마다 새 DSQL IAM 인증 토큰을 발급한다."""
    return _get_dsql_client().generate_db_connect_admin_auth_token(
        settings.cluster_endpoint,
        settings.region,
    )


def _provide_token(dialect, conn_rec, cargs, cparams):
    """
    새 물리 커넥션을 맺을 때마다 SQLAlchemy가 호출하는 do_connect 핸들러.

    토큰을 엔진 URL에 정적으로 박아두면, 풀이 나중에(overflow 확장 / pool_recycle /
    pool_pre_ping 재접속) 새 커넥션을 열 때 이미 서명이 만료된 토큰을 재사용해
    'Signature expired'로 실패한다. 여기서 매 커넥션마다 갓 발급한 토큰을 password로
    주입하면, 풀이 언제 커넥션을 열든 항상 유효한 토큰을 사용하게 된다.
    """
    cparams["password"] = _generate_token()


def _create_engine() -> Engine:
    # password는 URL에 넣지 않고 do_connect에서 동적으로 주입한다.
    url = URL.create(
        "auroradsql+psycopg",
        username=settings.db_user,
        host=settings.cluster_endpoint,
        database=settings.db_name
    )

    engine = create_engine(
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
    event.listen(engine, "do_connect", _provide_token)
    return engine


def get_dsql_engine_and_session() -> tuple[Engine, Session]:
    global _engine, _SessionLocal

    # 엔진은 컨테이너 수명 동안 하나만 유지한다.
    # 토큰 만료는 _provide_token이 커넥션 단위로 처리하므로 엔진 재생성이 필요 없다.
    if _engine is None:
        _engine = _create_engine()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

    return _engine, _SessionLocal()


@contextmanager
def get_session():
    _, session = get_dsql_engine_and_session()
    try:
        yield session
    finally:
        session.close()
