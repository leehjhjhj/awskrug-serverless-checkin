"""
db_connection.py 회귀 테스트 (common_layer).

근본 원인(버그): DSQL IAM 토큰을 엔진 URL에 정적 password로 박고 엔진을 최초 1회만
생성하면, 토큰 캐시를 갱신해도 풀은 영원히 최초 토큰을 재사용한다. 900초가 지나면
풀이 새로 여는 커넥션(overflow/recycle/pre-ping 재접속)이 'Signature expired'로 실패한다.

수정: 매 물리 커넥션마다 do_connect 이벤트에서 새 토큰을 발급한다.
"""
import os
import sys
import unittest
from unittest import mock

# 레포 루트(= settings.py / db_connection.py 심링크 위치)를 import 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import db_connection as dbc  # noqa: E402
from sqlalchemy import event  # noqa: E402


def _dialect_available() -> bool:
    """로컬 venv에 auroradsql+psycopg 다이얼렉트가 설치돼 있는지."""
    try:
        from sqlalchemy import create_engine
        from sqlalchemy.engine.url import URL
        create_engine(URL.create("auroradsql+psycopg", username="u", host="h", database="d"))
        return True
    except Exception:
        return False


DIALECT = _dialect_available()


class DbConnectionTokenTest(unittest.TestCase):
    def setUp(self):
        dbc._engine = None
        dbc._SessionLocal = None
        dbc._dsql_client = None

        self._settings_patch = mock.patch.multiple(
            dbc.settings,
            region="ap-northeast-2",
            cluster_endpoint="test-cluster.dsql.ap-northeast-2.on.aws",
            db_user="admin",
            db_name="postgres",
        )
        self._settings_patch.start()
        self.addCleanup(self._settings_patch.stop)

        self._counter = {"n": 0}

        def _fake_token(endpoint, region):
            self._counter["n"] += 1
            return f"token-{self._counter['n']}-{endpoint}-{region}"

        self.fake_client = mock.Mock()
        self.fake_client.generate_db_connect_admin_auth_token.side_effect = _fake_token
        self.boto3_patch = mock.patch.object(
            dbc.boto3, "client", return_value=self.fake_client
        )
        self.boto3_patch.start()
        self.addCleanup(self.boto3_patch.stop)

    def tearDown(self):
        if dbc._engine is not None:
            dbc._engine.dispose()
        dbc._engine = None
        dbc._SessionLocal = None
        dbc._dsql_client = None

    # --- 다이얼렉트 불필요: 핵심 토큰 로직 ---
    def test_fresh_token_per_connection(self):
        """do_connect가 호출될 때마다 '새' 토큰을 발급해 password로 주입해야 한다."""
        cparams_a, cparams_b = {}, {}
        dbc._provide_token(None, None, [], cparams_a)
        dbc._provide_token(None, None, [], cparams_b)

        self.assertIn("password", cparams_a)
        self.assertIn("password", cparams_b)
        self.assertNotEqual(
            cparams_a["password"], cparams_b["password"],
            "물리 커넥션마다 새 토큰이 발급되어야 한다",
        )
        self.assertEqual(
            self.fake_client.generate_db_connect_admin_auth_token.call_count, 2
        )

    def test_token_generated_with_endpoint_and_region(self):
        """토큰 발급은 설정된 cluster_endpoint/region으로 호출되어야 한다."""
        dbc._provide_token(None, None, [], {})
        self.fake_client.generate_db_connect_admin_auth_token.assert_called_with(
            "test-cluster.dsql.ap-northeast-2.on.aws", "ap-northeast-2"
        )

    # --- 다이얼렉트 필요: 엔진 배선 ---
    @unittest.skipUnless(DIALECT, "auroradsql+psycopg 다이얼렉트가 이 venv에 없음")
    def test_do_connect_listener_registered(self):
        """엔진에 do_connect 리스너가 등록되어 있어야 한다(풀이 여는 모든 커넥션에 적용)."""
        engine, _ = dbc.get_dsql_engine_and_session()
        self.assertTrue(event.contains(engine, "do_connect", dbc._provide_token))

    @unittest.skipUnless(DIALECT, "auroradsql+psycopg 다이얼렉트가 이 venv에 없음")
    def test_no_static_password_in_engine_url(self):
        """엔진 URL에 정적 토큰(password)이 박혀 있으면 안 된다(버그 회귀 방지)."""
        engine, _ = dbc.get_dsql_engine_and_session()
        self.assertIsNone(engine.url.password)


if __name__ == "__main__":
    unittest.main()
