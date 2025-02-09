import boto3


class ParameterStore:
    def __init__(self):
        self.ssm = boto3.client('ssm', region_name="ap-northeast-2")

    def get_parameter(self, parameter_name: str, with_decryption: bool = False) -> str:
        try:
            response = self.ssm.get_parameter(
                Name=parameter_name,
                WithDecryption=with_decryption
            )
            return response['Parameter']['Value']
        except Exception as e:
            print(f"파라미터 조회 실패: {e}")