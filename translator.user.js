// ==UserScript==
// @name         Enhanced GPT Translator with Language Toggle
// @namespace    http://tampermonkey.net/
// @version      17.2
// @description  A GPT-based translator with draggable/resizable UI, hotkeys, and language switching.
// @author       Cavo
// @match        https://my.livechatinc.com/*
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

(function () {
    'use strict';

const apiKeys = [
    "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‍",
    "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‍",
    "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",
    "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",
];

const getRandomApiKey = () => {
    return apiKeys[Math.floor(Math.random() * apiKeys.length)];
};
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    let sourceLang = "Английский";
    let targetLang = "Русский";

    // Список языков для переключения
    const languages = [
        "Английский", "Русский", "Французский", "Немецкий", "Испанский", "Итальянский", "Азербайджанский", "Китайский"
    ];

    // Создание окна переводчика
    const createTranslatorUI = () => {
        const translatorWindow = document.createElement('div');
        translatorWindow.id = 'translator-window';
        translatorWindow.innerHTML = `
            <div id="translator-header">
                <span>SC Translator</span>
                <button id="translator-close">✖</button>
            </div>
            <textarea id="translator-input" placeholder="Введите текст для перевода"></textarea>
            <div id="translator-languages">
                <button id="source-lang">${sourceLang}</button>
                <button id="swap-languages">⇄</button>
                <button id="target-lang">${targetLang}</button>
            </div>
            <button id="translator-translate">Перевести</button>
            <div id="translator-output"></div>
            <div id="resize-handle"></div>
        `;
        document.body.appendChild(translatorWindow);

        // Стили для окна
        GM_addStyle(`
            #translator-window {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                background-color: #222;
                color: #fff;
                border: 1px solid #555;
                border-radius: 8px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
                resize: both;
                overflow: hidden;
            }
            #translator-header {
                background-color: #444;
                padding: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #555;
                cursor: move;
            }
            #translator-header span {
                font-size: 14px;
                font-weight: bold;
            }
            #translator-header button {
                background: none;
                border: none;
                color: #fff;
                font-size: 14px;
                cursor: pointer;
            }
            #translator-input, #translator-output {
                width: 90%;
                margin: 10px auto;
                display: block;
                padding: 10px;
                font-size: 14px;
                color: #000;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 4px;
                resize: none;
            }
            #translator-translate {
                display: block;
                margin: 10px auto;
                padding: 8px 16px;
                background: #FF9800; /* LiveChat оранжевый */
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
            }
            #translator-translate:hover {
                background: #E67E22;
            }
            #translator-languages {
                display: flex;
                justify-content: space-around;
                margin: 10px auto;
                font-size: 14px;
            }
            #translator-languages button {
                background-color: #444;
                color: #fff;
                border: 1px solid #555;
                border-radius: 4px;
                padding: 5px 10px;
                cursor: pointer;
            }
            #translator-languages button:hover {
                background-color: #555;
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

        // Drag-and-drop функциональность
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

        // Закрытие окна
        document.getElementById('translator-close').addEventListener('click', () => {
            translatorWindow.style.display = 'none';
        });

        // Увеличение окна
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

    // Горячие клавиши Alt+C и Alt+X
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'c') {
            translatorWindow.style.display = 'block';
        } else if (e.altKey && e.key === 'x') {
            translatorWindow.style.display = 'none';
        }
    });

    // Обработчик кнопки перевода
    document.getElementById('translator-translate').addEventListener('click', async () => {
        const inputText = document.getElementById('translator-input').value.trim();
        if (!inputText) {
            alert('Введите текст для перевода!');
            return;
        }

        // Отправка текста в GPT
        const payload = {
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a professional translator. Translate this text from ${sourceLang} to ${targetLang}.`
                },
                {
                    role: "user",
                    content: inputText
                }
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

    // Переключение языков
    const updateLanguageButtons = () => {
        document.getElementById('source-lang').textContent = sourceLang;
        document.getElementById('target-lang').textContent = targetLang;
    };

    document.getElementById('swap-languages').addEventListener('click', () => {
        [sourceLang, targetLang] = [targetLang, sourceLang];
        updateLanguageButtons();
    });

    document.getElementById('source-lang').addEventListener('click', () => {
        const nextIndex = (languages.indexOf(sourceLang) + 1) % languages.length;
        sourceLang = languages[nextIndex];
        updateLanguageButtons();
    });

    document.getElementById('target-lang').addEventListener('click', () => {
        const nextIndex = (languages.indexOf(targetLang) + 1) % languages.length;
        targetLang = languages[nextIndex];
        updateLanguageButtons();
    });
})();
