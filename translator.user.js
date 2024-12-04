// ==UserScript==
// @name         Enhanced GPT Translator with Animations and Dynamic Header
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  GPT-based translator with enhanced UI, animations, and dynamic language display in the header.
// @author       You
// @match        https://my.livechatinc.com/*
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

(function () {
    'use strict';

    const apiKeys = [
      "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‍", // Ваш первый ключ
      "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‍", // Ваш второй ключ
      "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", // Ваш третий ключ
      "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‍",
      "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",
    ];

    const getRandomApiKey = () => apiKeys[Math.floor(Math.random() * apiKeys.length)];
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    let sourceLang = "Английский";
    let targetLang = "Русский";

    const languages = [
        "Английский", "Русский", "Французский", "Немецкий", "Испанский", "Итальянский",
        "Азербайджанский", "Китайский", "Японский", "Корейский", "Арабский", "Португальский"
    ];

    const updateHeaderLanguages = () => {
        const headerTitle = document.getElementById('translator-header-title');
        headerTitle.textContent = `GPT Translator (${sourceLang} → ${targetLang})`;
    };

    const createTranslatorUI = () => {
        const translatorWindow = document.createElement('div');
        translatorWindow.id = 'translator-window';
        translatorWindow.classList.add('hidden'); // Окно скрыто по умолчанию

        translatorWindow.innerHTML = `
            <div id="translator-header">
                <span id="translator-header-title">GPT Translator (${sourceLang} → ${targetLang})</span>
                <button id="translator-close">✖</button>
            </div>
            <textarea id="translator-input" placeholder="Введите текст для перевода"></textarea>
            <div id="translator-languages">
                <select id="source-lang">${languages.map(lang => `<option value="${lang}">${lang}</option>`).join('')}</select>
                <button id="swap-languages">⇄</button>
                <select id="target-lang">${languages.map(lang => `<option value="${lang}">${lang}</option>`).join('')}</select>
            </div>
            <button id="translator-translate">Перевести</button>
            <div id="translator-output" placeholder="Здесь будет перевод..."></div>
            <div id="resize-handle"></div>
        `;
        document.body.appendChild(translatorWindow);

        GM_addStyle(`
            #translator-window {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 380px;
                background-color: #1e1e1e;
                color: #fff;
                border: 1px solid #555;
                border-radius: 8px;
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease-in-out;
            }
            #translator-window.visible {
                transform: translateY(0);
                opacity: 1;
            }
            #translator-window.hidden {
                transform: translateY(100px);
                opacity: 0;
            }
            #translator-header {
                background-color: #444;
                padding: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #555;
                cursor: move;
            }
            #translator-header span {
                font-size: 16px;
                font-weight: bold;
                color: #FF9800;
            }
            #translator-input, #translator-output {
                width: 90%;
                margin: 10px auto;
                display: block;
                padding: 12px;
                font-size: 15px;
                background: #f4f4f4;
                color: #333;
                border: 1px solid #ccc;
                border-radius: 4px;
                resize: none;
            }
            #translator-translate {
                display: block;
                margin: 10px auto;
                padding: 10px 20px;
                background: #FF9800;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            #translator-translate:hover {
                background: #E67E22;
            }
            #translator-languages select {
                padding: 8px;
                border: 1px solid #777;
                border-radius: 6px;
                background-color: #333;
                color: white;
                font-size: 14px;
            }
            #translator-languages button {
                background-color: #FF9800;
                color: #fff;
                border: none;
                border-radius: 6px;
                padding: 8px 12px;
                cursor: pointer;
                transition: background 0.3s;
            }
            #resize-handle {
                width: 15px;
                height: 15px;
                background: #555;
                position: absolute;
                bottom: 0;
                right: 0;
                cursor: se-resize;
            }
        `);

        const header = translatorWindow.querySelector('#translator-header');
        let isDragging = false, offsetX, offsetY;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.offsetX;
            offsetY = e.offsetY;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                translatorWindow.style.left = `${e.pageX - offsetX}px`;
                translatorWindow.style.top = `${e.pageY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        document.getElementById('translator-close').addEventListener('click', () => {
            translatorWindow.classList.remove('visible');
            translatorWindow.classList.add('hidden');
        });

        const resizeHandle = document.getElementById('resize-handle');
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResize);
        });

        function resize(e) {
            translatorWindow.style.width = `${e.clientX - translatorWindow.offsetLeft}px`;
            translatorWindow.style.height = `${e.clientY - translatorWindow.offsetTop}px`;
        }

        function stopResize() {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResize);
        }

        return translatorWindow;
    };

    const translatorWindow = createTranslatorUI();

    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'c') {
            translatorWindow.classList.remove('hidden');
            translatorWindow.classList.add('visible');
        } else if (e.altKey && e.key === 'x') {
            translatorWindow.classList.remove('visible');
            translatorWindow.classList.add('hidden');
        }
    });

    document.getElementById('translator-translate').addEventListener('click', async () => {
        const inputText = document.getElementById('translator-input').value.trim();
        if (!inputText) {
            alert('Введите текст для перевода!');
            return;
        }

        const payload = {
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: `You are a professional translator. Translate this text from ${sourceLang} to ${targetLang}.` },
                { role: "user", content: inputText }
            ],
            max_tokens: 1000
        };

        GM.xmlHttpRequest({
            method: "POST",
            url: apiUrl,
            headers: {
                "Authorization": `Bearer ${getRandomApiKey()}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify(payload),
            onload: (response) => {
                try {
                    const responseData = JSON.parse(response.responseText);
                    const translatedText = responseData.choices[0].message.content.trim();
                    document.getElementById('translator-output').textContent = translatedText;
                } catch (err) {
                    console.error("Ошибка обработки ответа:", err);
                    document.getElementById('translator-output').textContent = "Ошибка перевода.";
                }
            },
            onerror: (err) => {
                console.error("Ошибка запроса:", err);
                document.getElementById('translator-output').textContent = "Ошибка соединения.";
            }
        });
    });

    document.getElementById('source-lang').addEventListener('change', (e) => {
        sourceLang = e.target.value;
        updateHeaderLanguages();
    });
    document.getElementById('target-lang').addEventListener('change', (e) => {
        targetLang = e.target.value;
        updateHeaderLanguages();
    });
    document.getElementById('swap-languages').addEventListener('click', () => {
        [sourceLang, targetLang] = [targetLang, sourceLang];
        document.getElementById('source-lang').value = sourceLang;
        document.getElementById('target-lang').value = targetLang;
        updateHeaderLanguages();
    });

})();
