// ==UserScript==
// @name         Translator
// @namespace    https://your-namespace.example/
// @version      1.6
// @description  Перевод текста с GPT API, улучшенное UI, обработка ошибок и возможность перетаскивания.
// @author       Cavo
// @match        https://my.livechatinc.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==
let currentTargetLanguage = GM_getValue('current_target_language', 'cs'); // По умолчанию используется английский язык

(function () {
  'use strict';
  const API_KEYS = [
   API
  ];
  let currentApiIndex = 0;

  // Проверка на наличие API-ключей
  if (API_KEYS.length === 0) {
    alert('API-ключи отсутствуют. Добавьте хотя бы один ключ в массив API_KEYS.');
    return;
  }

  const DEFAULT_TARGET_LANGUAGE = 'ru';
  const TRANSLATION_HISTORY_KEY = 'translation_history';
  const LAST_TRANSLATION_KEY = 'last_translation'; // Добавлено для сохранения последнего перевода
  let lastTranslation = GM_getValue(LAST_TRANSLATION_KEY, { source: null, target: DEFAULT_TARGET_LANGUAGE }); // Инициализация

  currentTargetLanguage = GM_getValue('current_target_language', DEFAULT_TARGET_LANGUAGE);

  // --- Создание UI ---
  const translatorHtml = `
    <div id="translator-panel">
      <h3>Translator</h3>
      <textarea id="input-text" placeholder="Введите текст для перевода"></textarea>
      <div class="controls">
          <select id="target-language">
          <option value="ru">Русский</option>
          <option value="en">Английский</option>
          <option value="de">Немецкий</option>
          <option value="el">Греческий</option>
          <option value="sq">Албанский</option>
          <option value="ar">Арабский</option>
          <option value="hy">Армянский</option>
          <option value="az">Азербайджанский</option>
          <option value="be">Белорусский</option>
          <option value="bg">Болгарский</option>
          <option value="my">Бирманский</option>
          <option value="cy">Валлийский</option>
          <option value="hu">Венгерский</option>
          <option value="vi">Вьетнамский</option>
          <option value="haw">Гавайский</option>
          <option value="ka">Грузинский</option>
          <option value="da">Датский</option>
          <option value="iw">Иврит</option>
          <option value="ga">Ирландский</option>
          <option value="is">Исландский</option>
          <option value="es">Испанский</option>
          <option value="it">Итальянский</option>
          <option value="kk">Казахский</option>
          <option value="kn">Каннада</option>
          <option value="zh">Китайский</option>
          <option value="ko">Корейский</option>
          <option value="ky">Киргизский</option>
          <option value="la">Латынь</option>
          <option value="lv">Латышский</option>
          <option value="lt">Литовский</option>
          <option value="lb">Люксембургский</option>
          <option value="mk">Македонский</option>
          <option value="ne">Непальский</option>
          <option value="no">Норвежский</option>
          <option value="pl">Польский</option>
          <option value="pt">Португальский</option>
          <option value="ro">Румынский</option>
          <option value="gd">Шотландский (гэльский)</option>
          <option value="sr">Сербский</option>
          <option value="sk">Словацкий</option>
          <option value="sl">Словенский</option>
          <option value="tl">Филиппинский</option>
          <option value="fi">Финский</option>
          <option value="fr">Французский</option>
          <option value="sv">Шведский</option>
          <option value="cs">Чешский</option>
          <option value="uk">Украинский</option>
          <option value="hr">Хорватский</option>
          <option value="hi">Хинди</option>
          <option value="et">Эстонский</option>
          <option value="tr">Турецкий</option>
          <option value="ja">Японский</option>
          </select>
          <button id="translate-button">Перевести</button>
      </div>
      <button id="clear-input">Очистить</button>
      <div id="result-section">
          <textarea id="translated-text" readonly placeholder="Перевод появится здесь"></textarea>
      </div>
      <div id="history-section">
          <h3>История переводов</h3>
          <ul id="translation-history"></ul>
          <button id="clear-history">Очистить историю</button>
      </div>
      <div id="error-message" style="display: none;"></div>
    </div>
    <style>
        #translator-panel {
      position: fixed;
      text-align: center;

      bottom: 30px;
      right: 30px;
      width: 400px;
      background: #ffffff;
      border: 2px solid #f9efef;
      padding: 40px;
      z-index: 10000;
      box-shadow: 0 30px 40px rgba(0, 0, 0, 0.5);
      border-radius: 20px;
      font-family: 'Arial', sans-serif;
      transition: all 0.3s ease;
    }
    #translator-panel.small {
      width: 300px;
      padding: 20px;
    }
    #translator-panel h3 {
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: bold;
      color: #333;
  }
    #translator-panel textarea {
      padding: 20px 0 0 10px;
      width: 100%;
      height: 100px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 10px;
      font-size: 14px;
      resize: none;
    }
    #translator-panel select, #translator-panel button {
      padding: 10px;
      margin-bottom: 10px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 10px;
      cursor: pointer;
    }
    #translator-panel select {
      width: calc(50% - 5px);
      margin-right: 5px;
    }
    #translator-panel button {
      background-color: #666666;
      color: #fff;
      font-weight: bold;
      transition: background-color 0.3s ease;
    }
    #translator-panel button:hover {
      background-color: #666666;
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
      </style>
    `;
  document.body.insertAdjacentHTML('beforeend', translatorHtml);

  const panel = document.getElementById('translator-panel');
  const inputText = document.getElementById('input-text');
  const targetLanguage = document.getElementById('target-language');
  const translateButton = document.getElementById('translate-button');
  const clearInputButton = document.getElementById('clear-input');
  const translatedText = document.getElementById('translated-text');
  const translationHistoryList = document.getElementById('translation-history');
  const clearHistoryButton = document.getElementById('clear-history');
  const errorMessage = document.getElementById('error-message');

  targetLanguage.value = currentTargetLanguage;

  targetLanguage.addEventListener('change', () => {
    currentTargetLanguage = targetLanguage.value;
    GM_setValue('current_target_language', currentTargetLanguage);
  });

  function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;
    element.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - element.offsetLeft;
      offsetY = e.clientY - element.offsetTop;
      element.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
      }
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
      element.style.cursor = 'move';
    });
  }
  makeDraggable(panel);

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
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant and translator.' },
            { role: 'user', content: `Translate to ${targetLang}: ${text}` },
          ],
          max_tokens: 1000,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API Error');
      }
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`Ошибка перевода: ${error.message}`);
    }
  }

  function updateTranslationHistory(original, translated) {
    const history = GM_getValue(TRANSLATION_HISTORY_KEY, []);
    history.unshift({ original, translated, timestamp: new Date().toISOString() });
    GM_setValue(TRANSLATION_HISTORY_KEY, history.slice(0, 5));
    renderTranslationHistory();
  }

  function renderTranslationHistory() {
    const history = GM_getValue(TRANSLATION_HISTORY_KEY, []);
    translationHistoryList.innerHTML = '';
    history.forEach(({ original, translated, timestamp }) => {
      const li = document.createElement('li');
      li.textContent = `${original} → ${translated} (${new Date(timestamp).toLocaleString()})`;
      translationHistoryList.appendChild(li);
    });
  }

  translateButton.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) {
      errorMessage.textContent = 'Введите текст для перевода';
      errorMessage.style.display = 'block';
      return;
    }
    try {
      errorMessage.style.display = 'none';
      translatedText.value = 'Перевод...';

      const translated = await translateText(text, currentTargetLanguage);

      translatedText.value = translated;
      updateTranslationHistory(text, translated);

      lastTranslation = { source: 'auto', target: currentTargetLanguage };
      GM_setValue(LAST_TRANSLATION_KEY, lastTranslation);
    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.style.display = 'block';
    }
  });

  clearInputButton.addEventListener('click', () => {
    inputText.value = '';
    translatedText.value = '';
    errorMessage.style.display = 'none';
  });

  clearHistoryButton.addEventListener('click', () => {
    GM_setValue(TRANSLATION_HISTORY_KEY, []);
    renderTranslationHistory();
  });

  renderTranslationHistory();

  // Добавление нового обработчика для выделения текста на странице
  document.addEventListener('mouseup', (event) => {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    // Проверяем, что выделен текст, и клик не произошел внутри текстового поля
    if (selectedText && !event.target.closest('#translator-panel')) {
      const inputText = document.getElementById('input-text');
      if (inputText) {
        inputText.value = selectedText; // Вставляем выделенный текст в поле ввода
      }
    }
  });

})();

