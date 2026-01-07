# 📝 Firebase Realtime Database 할일 관리 앱

Firebase Realtime Database를 사용하여 만든 할일 관리 웹 애플리케이션입니다.

## 🚀 기능

- ✅ **할일 추가** - Firebase Realtime Database에 실시간 저장
- ✏️ **할일 수정** - 할일 내용을 수정하고 Firebase에 업데이트
- 🗑️ **할일 삭제** - 개별 할일 삭제
- ☑️ **완료 체크** - 할일 완료/미완료 상태 토글
- 🔍 **필터링** - 전체/진행중/완료 필터로 할일 분류
- 🧹 **완료된 항목 일괄 삭제** - 완료된 모든 할일을 한번에 삭제
- 🔄 **실시간 동기화** - Firebase Realtime Database와 실시간 동기화

## 🛠️ 기술 스택

- **HTML5** - 구조
- **CSS3** - 스타일링 및 반응형 디자인
- **JavaScript (ES6+)** - 로직 및 Firebase 연동
- **Firebase Realtime Database** - 백엔드 데이터베이스

## 📦 설치 및 실행

1. 리포지토리 클론
```bash
git clone https://github.com/bonaringd/todo-study.git
cd todo-study
```

2. Firebase 설정
   - Firebase 콘솔에서 프로젝트 생성
   - Realtime Database 생성
   - Firebase 설정 정보를 `script.js`에 입력

3. 보안 규칙 설정
   - Firebase 콘솔 → Realtime Database → 규칙 탭
   - 다음 규칙 설정 (테스트용):
   ```json
   {
     "rules": {
       "todos": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

4. 실행
   - `index.html` 파일을 브라우저에서 열기
   - 또는 로컬 서버 실행:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   ```

## 📁 파일 구조

```
todo-study/
├── index.html      # 메인 HTML 파일
├── style.css       # 스타일시트
├── script.js       # JavaScript 로직 및 Firebase 연동
└── README.md       # 프로젝트 설명서
```

## 🔧 Firebase 설정

`script.js` 파일에서 Firebase 설정을 확인하세요:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "YOUR_DATABASE_URL"
};
```

## 📝 사용 방법

1. **할일 추가**: 입력창에 할일을 입력하고 "추가" 버튼 클릭 또는 Enter 키
2. **할일 수정**: 할일 옆의 "수정" 버튼 클릭 → 내용 수정 → "저장" 버튼
3. **할일 삭제**: 할일 옆의 "삭제" 버튼 클릭
4. **완료 체크**: 할일 앞의 체크박스 클릭
5. **필터링**: 상단의 "전체/진행중/완료" 버튼으로 필터링

## 🎨 특징

- 모던하고 세련된 UI/UX
- 반응형 디자인 (모바일 친화적)
- 실시간 데이터 동기화
- 부드러운 애니메이션 효과
- XSS 방지 보안 기능

## 📄 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.

## 👤 작성자

bonaringd

## 🔗 링크

- [GitHub Repository](https://github.com/bonaringd/todo-study.git)
- [Firebase Console](https://console.firebase.google.com)
