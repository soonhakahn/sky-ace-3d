# Sky Ace 3D

브라우저에서 바로 플레이 가능한 3D 경비행기 아케이드 게임입니다.

## Features
- Three.js 기반 3D 비행
- 장애물 회피 + 보너스 링 통과 점수 시스템
- WebAudio 기반 엔진/효과음
- 모바일 터치 컨트롤 지원
- 로컬 최고점 저장

## Controls
- PC: W/S(고도), A/D(롤), ←/→(방향), Space/Shift(부스트), P(일시정지)
- Mobile: 좌측 패드(방향), 우측 패드(고도/롤), BOOST 버튼

## Run locally
정적 파일이므로 아래처럼 실행할 수 있습니다.

```bash
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속.

---
배포 URL (모바일 포함):
- https://soonhakahn.github.io/sky-ace-3d/

## WordWise Companion

`wordwise/` 폴더에는 별도의 앱인 **WordWise Companion**(영어 단어/표현 학습 도우미 채팅 앱)이 있습니다.
자세한 내용은 [`wordwise/README.md`](./wordwise/README.md)를 참고하세요.

- 배포 URL: https://soonhakahn.github.io/sky-ace-3d/wordwise/
