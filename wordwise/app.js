(() => {
  "use strict";

  const STORAGE_KEY = "wordwise_api_key";
  const MODEL_KEY = "wordwise_model";
  const HISTORY_KEY = "wordwise_history";
  const DEFAULT_MODEL = "claude-sonnet-5";

  const SYSTEM_PROMPT = `You are WordWise Companion, an AI assistant that helps learners explore and understand English words, phrases, and sentences.

## General guidelines

When the user gives you an English word, phrase, or sentence, respond using the structure below.

Start the reply with the exact line "Think in English;" followed by a short, natural explanation of the core meaning (CEFR B1-B2 level):
- Explain the underlying concept rather than translating into another language.
- If the expression has multiple meanings, explain the most common one first.
- Use short, conversational sentences (2-5 sentences).
- Briefly note when native speakers typically use the expression, if that's helpful.
- Do not use dictionaries, grammar jargon, IPA, or bullet points in this opening explanation.
- Sound like a teacher helping the learner build an English way of thinking, not a dictionary.

After that opening explanation, always prioritize pronunciation training, natural speech rhythm, and chunking, not just translation. Place IPA directly underneath the relevant English text. Provide, in this order:

1. **Meaning** — a clear, concise definition.
2. **Etymology** — the origin and historical development of the word or phrase.
3. **Pronunciation** — IPA plus a simple phonetic spelling, with clear stress marks (ˈ primary stress, ˌ secondary stress).
4. **Usage** — brief notes on how and when it is typically used.
5. **Example Sentences** — five diverse sentences showing the word/phrase used in different contexts.

For every English word, phrase, or sentence you present (including each example sentence), add underneath it:
- Chunking marks using "/" to show natural pause points.
- Stress guidance showing which words or syllables to emphasize.
- Intonation guidance (rising ↗ or falling ↘) especially for questions, statements, and emphasis.
- Linking sounds between words (connected speech), e.g. "make_up" style notes.
- Reductions or dropped sounds that native speakers commonly use in fast, natural speech (e.g. "going to" → "gonna").

Be ready to answer natural follow-up questions about the word, its usage, collocations, or related vocabulary, using the conversation so far. Encourage the user to try using the word themselves, and if they make a mistake, correct it gently and positively.

## Bilingual output

Regardless of whether the user writes in English or Korean, ALWAYS give the full answer in both languages, clearly separated with these exact section headers on their own line:

**English**
(the complete English explanation, formatted as described above)

**한국어**
(the same content, explained naturally in Korean — not a literal word-for-word translation, but parallel in content and equally complete, including the meaning/etymology/pronunciation/usage/example breakdown and pronunciation coaching notes)

Keep formatting light: use "**bold**" only for section labels/headers, plain text otherwise. Never wrap the whole answer in a single code block.`;

  const chatEl = document.getElementById("chat");
  const composerEl = document.getElementById("composer");
  const inputEl = document.getElementById("input");
  const sendBtn = document.getElementById("sendBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const modelSelect = document.getElementById("modelSelect");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const closeSettingsBtn = document.getElementById("closeSettingsBtn");

  let history = loadHistory();
  let sending = false;

  function getApiKey() {
    return localStorage.getItem(STORAGE_KEY) || "";
  }

  function getModel() {
    return localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL;
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Very small markdown-ish renderer: **bold**, line breaks, and blank-line paragraphs.
  function renderMarkdown(text) {
    const escaped = escapeHtml(text);
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    const paragraphs = withBold.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`);
    return paragraphs.join("");
  }

  function addBubble(role, html, { asHtml = false, id } = {}) {
    const row = document.createElement("div");
    row.className = `bubble-row ${role}`;
    if (id) row.dataset.id = id;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    if (asHtml) {
      bubble.innerHTML = html;
    } else {
      bubble.textContent = html;
    }
    row.appendChild(bubble);
    chatEl.appendChild(row);
    chatEl.scrollTop = chatEl.scrollHeight;
    return row;
  }

  function renderWelcome() {
    chatEl.innerHTML = "";
    addBubble(
      "system",
      "영어 단어, 표현, 문장을 입력해보세요. 의미와 어원, 발음(IPA), 억양, 연음까지 영어와 한국어로 함께 설명해드립니다. 예: make up / break the ice / How's it going?",
      { asHtml: false }
    );
    for (const msg of history) {
      if (msg.role === "user") {
        addBubble("user", msg.content);
      } else {
        addBubble("assistant", renderMarkdown(msg.content), { asHtml: true });
      }
    }
  }

  function setSending(state) {
    sending = state;
    sendBtn.disabled = state;
    inputEl.disabled = state;
  }

  function autoResize() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + "px";
  }

  function openSettings() {
    apiKeyInput.value = getApiKey();
    modelSelect.value = getModel();
    settingsModal.classList.remove("hidden");
  }

  function closeSettings() {
    settingsModal.classList.add("hidden");
  }

  async function sendMessage(text) {
    const apiKey = getApiKey();
    if (!apiKey) {
      addBubble(
        "assistant",
        "먼저 설정(⚙️ Settings)에서 Anthropic API Key를 입력해주세요. / Please add your Anthropic API key in Settings first.",
        { asHtml: false }
      );
      openSettings();
      return;
    }

    history.push({ role: "user", content: text });
    saveHistory();

    const loadingRow = addBubble(
      "assistant",
      '<span class="typing"><span></span><span></span><span></span></span>',
      { asHtml: true }
    );

    setSending(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: getModel(),
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data?.error?.message || `Request failed (${res.status})`;
        loadingRow.querySelector(".bubble").classList.add("error");
        loadingRow.querySelector(".bubble").textContent = `오류 / Error: ${message}`;
        history.pop();
        saveHistory();
        return;
      }

      const replyText = (data.content || [])
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      loadingRow.querySelector(".bubble").innerHTML = renderMarkdown(replyText);
      history.push({ role: "assistant", content: replyText });
      saveHistory();
    } catch (err) {
      loadingRow.querySelector(".bubble").classList.add("error");
      loadingRow.querySelector(".bubble").textContent =
        "네트워크 오류가 발생했습니다. / A network error occurred: " + err.message;
      history.pop();
      saveHistory();
    } finally {
      setSending(false);
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }

  composerEl.addEventListener("submit", (e) => {
    e.preventDefault();
    if (sending) return;
    const text = inputEl.value.trim();
    if (!text) return;
    addBubble("user", text);
    inputEl.value = "";
    autoResize();
    sendMessage(text);
  });

  inputEl.addEventListener("input", autoResize);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      composerEl.requestSubmit();
    }
  });

  newChatBtn.addEventListener("click", () => {
    if (!confirm("대화 내용을 모두 지우고 새로 시작할까요? / Start a new conversation?")) return;
    history = [];
    saveHistory();
    renderWelcome();
  });

  settingsBtn.addEventListener("click", openSettings);
  closeSettingsBtn.addEventListener("click", closeSettings);
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  saveSettingsBtn.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, apiKeyInput.value.trim());
    localStorage.setItem(MODEL_KEY, modelSelect.value);
    closeSettings();
  });

  renderWelcome();
  autoResize();
})();
