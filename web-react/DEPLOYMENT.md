# 배포 가이드

## 🚀 로컬 개발 환경 시작하기

### 1. 패키지 설치

```bash
cd web-react
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

- 브라우저에서 http://localhost:3000 접속
- 자동 리로드 지원 (파일 수정 시 자동 반영)

### 3. 테스트 URL

- http://localhost:3000/sls/test
- http://localhost:3000/ausg/test
- http://localhost:3000/cert/test

## 📦 프로덕션 빌드

### 빌드 명령어

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── images/
│   ├── logo.png
│   ├── ausg.png
│   ├── cert.png
│   └── welcome.png
└── favicon.png
```

### 빌드 결과 미리보기

```bash
npm run preview
```

## ☁️ AWS S3 + CloudFront 배포

### 옵션 1: AWS CLI로 배포

#### 1. S3 버킷 생성 (최초 1회만)

```bash
aws s3 mb s3://awskrug-checkin-web
```

#### 2. S3 버킷 정책 설정

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::awskrug-checkin-web/*"
    }
  ]
}
```

#### 3. 정적 웹사이트 호스팅 활성화

```bash
aws s3 website s3://awskrug-checkin-web/ \
  --index-document index.html \
  --error-document index.html
```

#### 4. 빌드 및 업로드

```bash
npm run build
aws s3 sync dist/ s3://awskrug-checkin-web/ --delete
```

### 옵션 2: SAM Template에 추가

`template.yaml`에 다음 리소스 추가:

```yaml
  # S3 버킷
  WebBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${AWS::StackName}-web'
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false
        IgnorePublicAcls: false
        RestrictPublicBuckets: false

  # S3 버킷 정책
  WebBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref WebBucket
      PolicyDocument:
        Statement:
          - Effect: Allow
            Principal:
              Service: cloudfront.amazonaws.com
            Action: s3:GetObject
            Resource: !Sub '${WebBucket.Arn}/*'
            Condition:
              StringEquals:
                'AWS:SourceArn': !Sub 'arn:aws:cloudfront::${AWS::AccountId}:distribution/${WebDistribution}'

  # CloudFront Origin Access Control
  WebOAC:
    Type: AWS::CloudFront::OriginAccessControl
    Properties:
      OriginAccessControlConfig:
        Name: !Sub '${AWS::StackName}-web-oac'
        OriginAccessControlOriginType: s3
        SigningBehavior: always
        SigningProtocol: sigv4

  # CloudFront Distribution
  WebDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        DefaultRootObject: index.html
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt WebBucket.RegionalDomainName
            OriginAccessControlId: !Ref WebOAC
            S3OriginConfig: {}
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
            - OPTIONS
          CachedMethods:
            - GET
            - HEAD
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none
          Compress: true
          MinTTL: 0
          DefaultTTL: 86400
          MaxTTL: 31536000
        CustomErrorResponses:
          - ErrorCode: 404
            ResponseCode: 200
            ResponsePagePath: /index.html
          - ErrorCode: 403
            ResponseCode: 200
            ResponsePagePath: /index.html
        PriceClass: PriceClass_100

Outputs:
  WebBucketName:
    Description: S3 Bucket Name
    Value: !Ref WebBucket
  
  WebDistributionDomain:
    Description: CloudFront Distribution Domain
    Value: !GetAtt WebDistribution.DomainName
  
  WebDistributionId:
    Description: CloudFront Distribution ID
    Value: !Ref WebDistribution
  
  WebURL:
    Description: Web Application URL
    Value: !Sub 'https://${WebDistribution.DomainName}'
```

### SAM 배포 후 웹 업로드

```bash
# SAM 배포
sam build
sam deploy

# 버킷 이름 가져오기
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name your-stack-name \
  --query 'Stacks[0].Outputs[?OutputKey==`WebBucketName`].OutputValue' \
  --output text)

# 웹 빌드 및 업로드
cd web-react
npm run build
aws s3 sync dist/ s3://${BUCKET_NAME}/ --delete

# CloudFront 캐시 무효화
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name your-stack-name \
  --query 'Stacks[0].Outputs[?OutputKey==`WebDistributionId`].OutputValue' \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"
```

## 🔄 배포 자동화 스크립트

`web-react/deploy.sh` 생성:

```bash
#!/bin/bash

set -e

echo "🔨 빌드 중..."
npm run build

echo "📦 S3 업로드 중..."
aws s3 sync dist/ s3://awskrug-checkin-web/ --delete

echo "🔄 CloudFront 캐시 무효화 중..."
DISTRIBUTION_ID="your-distribution-id"
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"

echo "✅ 배포 완료!"
echo "🌐 URL: https://your-domain.com"
```

실행:

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🧪 배포 전 체크리스트

- [ ] `npm run build` 성공 확인
- [ ] `npm run preview`로 빌드 결과 확인
- [ ] API 엔드포인트 URL 확인 (`src/config/api.js`)
- [ ] 이미지 파일 모두 포함 확인 (`public/images/`)
- [ ] 소모임 설정 확인 (`src/config/groups.js`)
- [ ] CloudFront Custom Error Pages 설정 확인

## 🔧 CloudFront 설정 (중요!)

### ⚠️ SPA 라우팅을 위한 필수 설정

React Router를 사용하므로 CloudFront에서 모든 404 에러를 `index.html`로 리다이렉트해야 합니다.

### CloudFront Console 설정:

1. CloudFront 콘솔 접속
2. Distribution 선택
3. "Error Pages" 탭
4. "Create Custom Error Response" 클릭

**설정 1:**
- HTTP Error Code: `404`
- Customize Error Response: `Yes`
- Response Page Path: `/index.html`
- HTTP Response Code: `200`

**설정 2:**
- HTTP Error Code: `403`
- Customize Error Response: `Yes`
- Response Page Path: `/index.html`
- HTTP Response Code: `200`

### 설정하지 않으면?

- ❌ `https://your-domain.com/sls/241224` 직접 접속 시 404 에러
- ❌ 페이지 새로고침 시 404 에러
- ✅ `https://your-domain.com`에서 시작해서 클릭은 정상 작동

## 🌐 커스텀 도메인 설정 (선택사항)

### 1. ACM 인증서 발급 (us-east-1 리전)

```bash
aws acm request-certificate \
  --domain-name awskrug-sls.com \
  --validation-method DNS \
  --region us-east-1
```

### 2. CloudFront에 인증서 연결

```yaml
WebDistribution:
  Type: AWS::CloudFront::Distribution
  Properties:
    DistributionConfig:
      Aliases:
        - awskrug-sls.com
      ViewerCertificate:
        AcmCertificateArn: arn:aws:acm:us-east-1:123456789:certificate/xxx
        SslSupportMethod: sni-only
        MinimumProtocolVersion: TLSv1.2_2021
```

### 3. Route53 레코드 추가

```yaml
WebDNSRecord:
  Type: AWS::Route53::RecordSet
  Properties:
    HostedZoneId: Z1234567890ABC
    Name: awskrug-sls.com
    Type: A
    AliasTarget:
      DNSName: !GetAtt WebDistribution.DomainName
      HostedZoneId: Z2FDTNDATAQYW2  # CloudFront hosted zone ID
```

## 📊 배포 후 확인 사항

### 1. URL 테스트

```bash
# 기본 페이지
curl https://your-domain.com

# 특정 소모임 페이지
curl https://your-domain.com/sls/241224
curl https://your-domain.com/ausg/250101
curl https://your-domain.com/cert/250115
```

### 2. API 연동 테스트

개발자 도구(F12)에서 Network 탭 확인:
- API 호출 성공 여부
- CORS 에러 없는지 확인

### 3. 성능 테스트

- https://pagespeed.web.dev 에서 성능 측정
- Lighthouse 점수 확인

## 🐛 트러블슈팅

### 404 에러 발생

**증상**: `/sls/241224` 직접 접속 시 404

**해결**: CloudFront Custom Error Pages 설정 확인

### CORS 에러

**증상**: API 호출 시 CORS 에러

**해결**: API Gateway에서 CORS 활성화:

```bash
aws apigatewayv2 update-api \
  --api-id your-api-id \
  --cors-configuration AllowOrigins="https://your-domain.com"
```

### 이미지 표시 안됨

**증상**: 로고/이미지가 깨짐

**해결**:
1. `public/images/` 폴더에 이미지 존재 확인
2. 빌드 후 `dist/images/` 폴더 확인
3. S3에 이미지 업로드 확인

### 업데이트가 반영 안됨

**증상**: 코드 수정 후에도 이전 버전 표시

**해결**: CloudFront 캐시 무효화

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 💰 비용 예측

### S3
- 저장: ~100MB = $0.023/월
- 요청: 10,000 GET = $0.004/월

### CloudFront
- 데이터 전송: 10GB/월 = $0.85/월
- 요청: 10,000 = $0.01/월

**총 예상 비용**: ~$1/월 (소규모 트래픽 기준)

## 📝 유지보수

### 정기 업데이트

```bash
# 패키지 업데이트 확인
npm outdated

# 업데이트
npm update

# 보안 취약점 확인
npm audit

# 자동 수정
npm audit fix
```

### 새 소모임 추가 프로세스

1. 로고 이미지 준비 (`public/images/newgroup.png`)
2. `src/config/groups.js`에 설정 추가
3. 빌드 및 배포
4. URL 테스트: `/newgroup/test`

### 모니터링

- CloudWatch Logs로 CloudFront 로그 확인
- S3 버킷 메트릭 확인
- API Gateway 호출 통계 확인

