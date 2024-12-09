// ==UserScript==
// @name         GPT Translator with Advanced Error Handling and Enhanced UI
// @namespace    https://your-namespace.example/
// @version      1.3
// @description  Перевод текста с GPT API, улучшенное UI и обработка ошибок для удобного использования.
// @author       Your Name
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  'use strict';

  // --- Настройки API ---
  const API_KEYS = [
    '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',
    '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',
    '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',
    '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',
    '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',
  ];
  let currentApiIndex = 0;

  const DEFAULT_TARGET_LANGUAGE = 'ru'; // Язык перевода по умолчанию
  const TRANSLATION_HISTORY_KEY = 'translation_history';

  // --- Создание UI ---
  const translatorHtml = `
  <div id="translator-panel">
    <h3>GPT Translator</h3>
    <textarea id="input-text" placeholder="Введите текст для перевода"></textarea>
    <div class="controls">
      <select id="target-language">
        <option value="ru">Русский</option>
        <option value="en">Английский</option>
        <option value="es">Испанский</option>
        <option value="fr">Французский</option>
      </select>
      <button id="translate-button">Перевести</button>
    </div>
    <button id="clear-input">Очистить</button>
    <div id="result-section">
      <textarea id="translated-text" readonly placeholder="Перевод появится здесь"></textarea>
      <button id="copy-translation">Скопировать перевод</button>
    </div>
    <div id="history-section">
      <h3>История переводов</h3>
      <ul id="translation-history"></ul>
      <button id="clear-history">Очистить историю</button>
    </div>
    <div id="error-message" style="display: none;"></div>
  </div>
  `;

  GM_addStyle(`
  #translator-panel {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 380px;
    background: #ffffff;
    border: 1px solid #ddd;
    padding: 15px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    font-family: 'Arial', sans-serif;
    transition: all 0.3s ease;
  }
  #translator-panel h3 {
    margin: 0 0 10px;
    font-size: 18px;
    color: #333;
  }
  #translator-panel textarea {
    width: 400px;
    height: 80px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
    padding: 8px;
    font-size: 14px;
    resize: none;
  }
  #translator-panel select, #translator-panel button {
    padding: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
  }
  #translator-panel select {
    width: calc(50% - 5px);
    margin-right: 5px;
  }
  #translator-panel button {
    background-color: #007bff;
    color: #fff;
    font-weight: bold;
  }
  #translator-panel button:hover {
    background-color: #0056b3;
  }
  #result-section {
    margin-top: 10px;
  }
  #translation-history {
    list-style-type: none;
    padding: 0;
    max-height: 150px;
    overflow-y: auto;
  }
  #translation-history li {
    margin-bottom: 5px;
    background: #f1f1f1;
    padding: 5px;
    border-radius: 3px;
  }
  #error-message {
    margin-top: 10px;
    padding: 10px;
    background-color: #ffcccc;
    color: #990000;
    border-radius: 5px;
    font-size: 14px;
  }
  `);

  document.body.insertAdjacentHTML('beforeend', translatorHtml);

  const panel = document.getElementById('translator-panel');
  const inputText = document.getElementById('input-text');
  const targetLanguage = document.getElementById('target-language');
  const translateButton = document.getElementById('translate-button');
  const clearInputButton = document.getElementById('clear-input');
  const translatedText = document.getElementById('translated-text');
  const copyTranslationButton = document.getElementById('copy-translation');
  const translationHistoryList = document.getElementById('translation-history');
  const clearHistoryButton = document.getElementById('clear-history');
  const errorMessage = document.getElementById('error-message');

  // --- Утилиты ---
  function getCurrentApiKey() {
    const key = API_KEYS[currentApiIndex];
    currentApiIndex = (currentApiIndex + 1) % API_KEYS.length;
    return key;
  }

  async function translateText(text, targetLang) {
    const apiKey = getCurrentApiKey();
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant and translator." },
            { role: "user", content: `Translate the following text to ${targetLang}: ${text}` }
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`Ошибка перевода: ${error.message}`);
    }
  }

  // --- История переводов ---
  function updateTranslationHistory(text, translated) {
    const history = GM_getValue(TRANSLATION_HISTORY_KEY, []);
    history.unshift({ text, translated, date: new Date().toISOString() });
    GM_setValue(TRANSLATION_HISTORY_KEY, history.slice(0, 5)); // Храним только последние 5 переводов
    renderTranslationHistory();
  }

  function renderTranslationHistory() {
    const history = GM_getValue(TRANSLATION_HISTORY_KEY, []);
    translationHistoryList.innerHTML = '';
    history.forEach((entry) => {
      const li = document.createElement('li');
      li.textContent = `${entry.text} → ${entry.translated} (${new Date(entry.date).toLocaleString()})`;
      translationHistoryList.appendChild(li);
    });
  }

  function clearHistory() {
    GM_setValue(TRANSLATION_HISTORY_KEY, []);
    renderTranslationHistory();
  }

  // --- Обработчики событий ---
  translateButton.addEventListener('click', async () => {
    const text = inputText.value.trim();
    const targetLang = targetLanguage.value;
    if (text) {
      try {
        errorMessage.style.display = 'none'; // Скрыть ошибку
        translatedText.value = 'Перевод...';
        const translated = await translateText(text, targetLang);
        translatedText.value = translated;
        updateTranslationHistory(text, translated);
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
        translatedText.value = '';
      }
    }
  });

  clearInputButton.addEventListener('click', () => {
    inputText.value = '';
    translatedText.value = '';
    errorMessage.style.display = 'none';
  });

  copyTranslationButton.addEventListener('click', () => {
    GM_setClipboard(translatedText.value);
  });

  clearHistoryButton.addEventListener('click', clearHistory);

  renderTranslationHistory();
})();
