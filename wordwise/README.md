# WordWise Companion

영어 단어·표현·문장의 의미, 어원, 발음(IPA), 억양, 연음까지 영어와 한국어로 함께 설명해주는 채팅형 학습 도우미입니다. 정적 파일(HTML/CSS/JS)만으로 동작하며, 브라우저에서 Anthropic API를 직접 호출합니다.

## Features
- "Think in English" 스타일의 쉬운 영어 설명 + 의미/어원/발음/용법/예문 5개
- IPA, 강세, 청킹(/), 억양(↗↘), 연음·축약 발음 코칭
- 모든 답변을 영어와 한국어로 각각 완전하게 제공
- 대화 맥락을 기억하는 후속 질문 지원
- API 키는 브라우저 로컬 저장소에만 저장 (서버 없음)

## Run locally
정적 파일이므로 아래처럼 실행할 수 있습니다.

```bash
cd wordwise
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속 후, 우측 상단 **⚙️ Settings**에서 [Anthropic Console](https://console.anthropic.com/settings/keys)에서 발급받은 API 키를 입력하세요.

## Notes
- API 키는 `localStorage`에만 저장되고, `https://api.anthropic.com`으로 직접 전송됩니다. 다른 서버로 전송되지 않지만, 브라우저 네트워크 탭에서는 노출될 수 있으므로 공용 기기에서는 사용 후 키를 삭제하는 것을 권장합니다.
- GitHub Pages 등 정적 호스팅에 그대로 배포할 수 있습니다.
