# 수학 게임 (Math Game)

초등학교 2학년을 위한 재미있는 수학 학습 게임입니다.

## 🎯 게임 특징

- **사칙연산 학습**: 덧셈, 뺄셈, 곱셈, 나눗셈
- **레벨별 난이도**: 한자리수, 두자리수, 세자리수
- **점수 시스템**: 난이도에 따른 차등 점수
- **랭킹 시스템**: 상위 10명의 최고 점수 기록
- **정보 저장**: 브라우저에 학생 정보 자동 저장

## 🚀 설치 및 실행

1. Python 가상환경 생성 (권장)
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate     # Windows
```

2. 필요한 패키지 설치
```bash
pip install -r requirements.txt
```

3. 애플리케이션 실행
```bash
python app.py
```

4. 브라우저에서 접속
```
http://localhost:5000
```

## 🎮 게임 방법

1. **학생 정보 입력**: 학교명, 학년, 이름 입력
2. **연산 선택**: 덧셈, 뺄셈, 곱셈, 나눗셈 중 선택
3. **레벨 선택**: 난이도별 레벨 선택
4. **문제 풀기**: 화면에 나오는 문제의 답 입력
5. **점수 확인**: 정답 시 레벨별 점수 획득
6. **게임 종료**: 점수를 저장하고 랭킹 확인

## 📊 점수 시스템

- **레벨 1 (한자리수)**: 정답당 10점
- **레벨 2 (두자리수)**: 정답당 20점  
- **레벨 3 (세자리수)**: 정답당 30점

## 🏆 랭킹 시스템

- 상위 10명의 최고 점수 기록
- 학교, 학년, 이름, 점수, 달성일시 표시
- 1-3위는 특별한 메달 표시

## 📁 프로젝트 구조

```
math-game/
├── app.py              # Flask 메인 애플리케이션
├── requirements.txt    # Python 의존성 패키지
├── rankings.json       # 랭킹 데이터 (자동 생성)
├── templates/          # HTML 템플릿
│   ├── index.html      # 메인 페이지 (학생 정보 입력)
│   ├── game.html       # 게임 플레이 페이지
│   └── rankings.html   # 랭킹 페이지
└── static/
    └── css/
        └── style.css   # 스타일시트
```

## 🎨 주요 기능

### 학생 정보 관리
- 브라우저 로컬 스토리지에 정보 저장
- 재방문 시 자동으로 정보 불러오기

### 게임 플레이
- 직관적인 UI/UX 디자인
- 실시간 점수 표시
- 즉시 피드백 제공

### 랭킹 시스템
- JSON 파일 기반 데이터 저장
- 최고 점수 순 정렬
- 상위 50명 데이터 보관

## 🛠 기술 스택

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **UI Framework**: Bootstrap 5
- **데이터 저장**: JSON 파일, 브라우저 로컬 스토리지

## 📱 반응형 디자인

모바일, 태블릿, 데스크톱에서 모두 최적화된 화면 제공

## 🔧 개발자 모드

개발 시 `debug=True`로 설정되어 있어 코드 변경 시 자동 재시작됩니다.

프로덕션 환경에서는 `debug=False`로 변경하고 적절한 WSGI 서버를 사용하세요.

## 🚀 자동 배포 설정

GitHub Actions를 통한 자동 배포가 설정되어 있습니다.

### 📋 필요한 GitHub Secrets

Repository Settings > Secrets and variables > Actions에서 다음 시크릿을 설정해주세요:

- `SERVER_HOST`: 배포할 서버의 IP 주소 또는 도메인
- `SERVER_USERNAME`: 서버 SSH 접속용 사용자명
- `SERVER_SSH_KEY`: 서버 접속용 SSH 개인키 (RSA 또는 ED25519)

### 🔧 서버 환경 요구사항

배포 대상 서버에 다음이 설치되어 있어야 합니다:

```bash
# Python 3.9 이상
python3 --version

# pip
python3 -m pip --version

# Git
git --version
```

### 📁 배포 디렉토리

- 배포 위치: `/home/{username}/math1/`
- 자동 생성되는 파일:
  - `venv/`: Python 가상환경
  - `flask-server.pid`: Flask 서버 PID 파일
  - `flask.log`: 애플리케이션 로그

### 🔄 배포 과정

1. `main` 브랜치에 push 시 자동 실행
2. Git으로 최신 코드 다운로드
3. 기존 Flask 서버 종료
4. Python 가상환경 생성/업데이트
5. 새 Flask 서버 시작

### 🌐 접속 정보

배포 완료 후 다음 URL로 접속:
- `http://your-server-ip:5001`

### 🔍 배포 상태 확인

서버에서 배포 상태를 확인하려면:

```bash
# 프로세스 확인
ps aux | grep "python app.py"

# 로그 확인
tail -f /home/{username}/math1/flask.log

# 서비스 상태 확인
curl http://localhost:5001/health
```
