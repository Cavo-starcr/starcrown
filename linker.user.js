// ==UserScript==
// @name         Enhanced LiveChat Linker
// @version      2.0.1
// @description  Enhancements for LiveChat interface
// @author       Cavo
// @match        https://my.livechatinc.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=livechatinc.com
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://update.greasyfork.org/scripts/28536/184529/GM_config.js
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Initialize configuration
    GM_config.init({
        'id': 'MyConfig',
        'title': 'Настройки скрипта',
        'fields': {
            'colors': {
                'label': 'Подсветка чата (верхняя строка)',
                'type': 'checkbox',
                'default': true
            },
            'emailLinks': {
                'label': 'Ссылка вместо почты или телефона в правом меню',
                'type': 'checkbox',
                'default': true
            },
            'emailChatLinks': {
                'label': 'Ссылка вместо email адресов в чате',
                'type': 'checkbox',
                'default': true
            },
            'highlightIfMobile': {
                'label': 'Подсветка при использовании телефона',
                'type': 'checkbox',
                'default': false
            }
        }
    });

    // Add keyboard shortcut to open config
    document.addEventListener('keyup', (event) => {
        if ((event.key === '/' || event.key === '.') && event.ctrlKey) {
            GM_config.open();
        }
    });

    // Function to create email or phone link
   function createEmailLink(email, projectName) {
    if (window.location.href.includes('mentum.administrativedistrict.com')) {
        // Создаёт ссылку для mentum.administrativedistrict.com
        return `https://mentum.administrativedistrict.com/user?email=${encodeURIComponent(email)}`;
    } else {
        // Старый способ для других систем
        const baseURL = `https://${projectName}.casino-backend.com/backend/players/find_user`;
        return email.startsWith('+')
            ? `${baseURL}?phone_number=${encodeURIComponent(email)}&commit=Find`
            : `${baseURL}?id_or_email=${encodeURIComponent(email)}&commit=Find`;
    }
}

    // Helper function for querySelector
    function $(selector) {
        return document.querySelector(selector);
    }

    // Function to process email elements
    function processEmailElements() {
        const isEmailLinksEnabled = GM_config.get('emailLinks');
        const isEmailChatLinksEnabled = GM_config.get('emailChatLinks');
        const isMobileHighlightEnabled = GM_config.get('highlightIfMobile');

        let chatEmailSelector;
        let projectGroupSelector;
        if (window.location.href.includes('chats')) {
            chatEmailSelector = '.css-w2ducz';
            projectGroupSelector = '.css-1s5f4dg';
        } else if (window.location.href.includes('archives')) {
            chatEmailSelector = '.css-cinmy0';
            projectGroupSelector = '.css-1xt3h1w';
        }

        const chatEmailElem = $(chatEmailSelector);
        const projectNameElem = $(projectGroupSelector);

        if (chatEmailElem && projectNameElem && isEmailLinksEnabled) {
            if (!$('#enhancerLinkElem')) {
                const email = chatEmailElem.innerText;
                let currentProjectName = projectNameElem.innerText.split(' ')[0].toLowerCase();

                // Additional logic for 'General' and 'sport' project
                if (currentProjectName === 'general') {
                    currentProjectName = 'kaasino'; // Redirect 'General' to 'kaasino'
                } else if (currentProjectName === 'sport') {
                    const keywords = ['goldencrown', 'goldenstar', 'kaasino'];
                    const visitedPagesBlock = $('[data-testid="visited-pages"]');
                    if (visitedPagesBlock) {
                        const visitedPagesList = visitedPagesBlock.querySelectorAll('a');
                        for (const currentPage of visitedPagesList) {
                            const pageUrl = new URL(currentPage.href).hostname;
                            for (const keyword of keywords) {
                                if (pageUrl.includes(keyword)) {
                                    currentProjectName = keyword;
                                    break;
                                }
                            }
                            if (currentProjectName !== 'sport') break;
                        }
                    }
                }

                const emailLink = createEmailLink(email, currentProjectName);
                const linkElem = document.createElement('a');
                linkElem.id = 'enhancerLinkElem';
                linkElem.target = '_blank';
                linkElem.href = emailLink;
                linkElem.textContent = email;

                chatEmailElem.innerHTML = '';
                chatEmailElem.appendChild(linkElem);
            }
        }

        // Process 'mailto' links in chat messages
        if (projectNameElem && isEmailChatLinksEnabled) {
            const currentProjectName = projectNameElem.innerText.split(' ')[0].toLowerCase();
            const linksMail = document.querySelectorAll('a[href^="mailto:"]');
            if (linksMail.length > 0) {
                for (let link of linksMail) {
                    const email = link.href.split('mailto:')[1];
                    link.href = createEmailLink(email, currentProjectName);
                }
            }
        }

        // Highlight if user is on mobile
        if (isMobileHighlightEnabled) {
            const userAgentBlocks = document.querySelectorAll('.css-1hak7ay');
            let userAgentElem;
            if (userAgentBlocks.length > 0) {
                for (let block of userAgentBlocks) {
                    if (block.innerText.includes('User agent')) {
                        userAgentElem = block.querySelector('.css-osp6nc');
                        break;
                    }
                }
            }

            if (userAgentElem && !$('#enhancerMobileUserBadge')) {
                const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
                if (mobileRegex.test(userAgentElem.innerText.toLowerCase())) {
                    const badgeContainer = document.querySelector('.fs-mask.css-128nwuf');
                    if (badgeContainer) {
                        const badge = document.createElement('span');
                        badge.id = 'enhancerMobileUserBadge';
                        badge.style.cssText = 'background-color:red;color:white;padding:4px 8px;text-align:center;border-radius:5px;margin-left: 10px;';
                        badge.textContent = 'MOBILE';
                        badgeContainer.appendChild(badge);
                    }
                }
            }
        }
    }

    // Use MutationObserver to detect changes and apply the script
    const observer = new MutationObserver(() => {
        processEmailElements();
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
