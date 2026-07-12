# Daily English Telegram Bot

매일 아침 6:30(KST)에 [@shahn01bot](https://t.me/shahn01bot) 텔레그램 봇으로
일상 영어 문장 10개를 자동 발송하는 기능입니다.

발송은 코드가 아니라 Claude Code **Routine**(예약 실행)이 담당합니다. Routine이
매일 새 세션을 띄워 아래 포맷대로 콘텐츠를 새로 생성한 뒤, Telegram Bot API로
직접 전송합니다. 이 문서는 그 포맷 스펙과 예시입니다.

## 콘텐츠 포맷

문장 10개, 각 문장마다:

1. **영어 문장**
2. **발음기호 (IPA)**
3. **연음/생략 등 실제 원어민 발음 표기** (What are you → Whadaya 같은 축약/연음 설명)
4. **한글 번역**

10개 문장이 끝난 뒤, 하단에 **주요 단어 분석**을 별도 섹션으로 정리합니다
(단어/표현, 품사, 의미, 사용 노트).

주제는 요일별로 로테이션하여 반복을 줄입니다
(예: 월-회사/업무, 화-쇼핑/일상, 수-음식점/카페, 목-여행/교통, 금-소셜/약속, 토-취미/여가, 일-집/가족).

## 예시 (샘플 1일치 — 일상 대화 표현)

1. **I'm running a little late.**
   - IPA: /aɪm ˈrʌnɪŋ ə ˈlɪtl leɪt/
   - 연음: "running a" → "runnin-a"로 자연스럽게 이어짐, "little"의 t는 flap 처리되어 "li-dl"에 가깝게 들림. 전체적으로 "I'm runnin' a li'l late"처럼 빠르게 발음.
   - 번역: 저 조금 늦어요.

2. **Can you pass me the salt?**
   - IPA: /kən jə pæs mi ðə sɔːlt/
   - 연음: "Can you" → "Can-ya" /kənjə/로 축약, "the"는 약화되어 짧게 /ðə/.
   - 번역: 소금 좀 건네줄래?

3. **What are you up to this weekend?**
   - IPA: /wʌt ər jə ʌp tə ðɪs ˈwiːkˌɛnd/
   - 연음: "What are you" → "Whadaya" /wʌdəjə/ (t가 d로 flap, are·you가 하나로 이어짐), "up to" → "up-tə".
   - 번역: 이번 주말에 뭐 할 거야?

4. **I couldn't agree with you more.**
   - IPA: /aɪ ˈkʊdənt əˈgri wɪð jə mɔːr/
   - 연음: "couldn't"의 t는 거의 생략되어 "coudn"처럼, "with you" → "withya" /wɪðjə/.
   - 번역: 전적으로 동감이에요.

5. **Let me get back to you on that.**
   - IPA: /lɛt mi gɛt bæk tə jə ɒn ðæt/
   - 연음: "Let me" → "Lemme" /ˈlɛmi/, "to you" → "tə yə"로 빠르게 이어짐.
   - 번역: 그건 나중에 다시 알려줄게요.

6. **I've got a ton of work to do.**
   - IPA: /aɪv gɒt ə tʌn əv wɜːrk tə du/
   - 연음: "got a" → "godda"(t가 d로 flap), "ton of" → "tunuv"로 연음.
   - 번역: 할 일이 산더미예요.

7. **Do you want to grab a coffee?**
   - IPA: /də jə wɒnt tə græb ə ˈkɒfi/
   - 연음: "Do you" → "D'ya" /dʒə/, "want to" → "wanna" /ˈwɑnə/.
   - 번역: 커피 한 잔 할래?

8. **I'm not sure what you mean.**
   - IPA: /aɪm nɒt ʃʊr wʌt jə min/
   - 연음: "what you" → "whatcha" /ˈwʌtʃə/.
   - 번역: 무슨 말인지 잘 모르겠어요.

9. **It's been a long day.**
   - IPA: /ɪts bɪn ə lɔːŋ deɪ/
   - 연음: "It's been"이 빠르게 축약되고, "a"는 거의 들리지 않을 정도로 약화됨.
   - 번역: 정말 힘든 하루였어요.

10. **Give me a second, I'll be right there.**
    - IPA: /gɪv mi ə ˈsɛkənd aɪl bi raɪt ðɛr/
    - 연음: "Give me a" → "Gimme a" /ˈgɪmi ə/, "I'll be"는 끊김 없이 이어짐.
    - 번역: 잠깐만요, 금방 갈게요.

### 주요 단어 분석

- **run late** (구동사): 늦다
- **pass** (동사): 건네주다
- **up to** (전치사구): ~하는 중인, 계획 중인
- **couldn't agree more** (관용표현): 전적으로 동의하다
- **get back to (someone)** (구동사): 나중에 다시 연락하다
- **a ton of** (구어체 강조 표현): 아주 많은
- **grab a coffee** (캐주얼 표현): 커피 마시러 가다
- **not sure** (형용사구): 확실하지 않은
- **long day** (명사구): 힘들고 지친 하루
- **give me a second** (관용표현): 잠깐만 기다려줘

## 발송 방식

- Claude Code **Routine**을 매일 06:30 KST(=21:30 UTC 전날)에 실행되도록 예약.
- Routine 프롬프트가 위 포맷에 따라 새로운 10문장을 생성하고, 요일별 주제로 로테이션.
- 생성된 텍스트를 Telegram Bot API(`sendMessage`)로 `https://t.me/shahn01bot` 채팅으로 전송.
- 메시지가 Telegram 4096자 제한을 넘으면 (예: 1~10번 문장 / 주요 단어 분석) 두 개의 메시지로 분할 전송.
