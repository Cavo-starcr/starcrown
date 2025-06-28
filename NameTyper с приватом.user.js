// ==UserScript==
// @name         NameTyper с приватом
// @namespace    Violentmonkey Scripts
// @version      2.5.7
// @description  types username
// @author       Alex
// @license       mit
// @match        https://my.livechatinc.com/*
// @grant        none
// ==/UserScript==
// поправил ввод имени - теперь при ALT+Q имя вставит всегда в начале написанного через запятую, остальное нижним
//21.12.2023 : теперь работает и в режиме супервайзера


(async function() {
    'use strict';
let massivEngl="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   function update(phrase, name){
     let value;
      if(!document.querySelectorAll('[placeholder="Type a message"]')[0]){
                     value = document.querySelector('[placeholder="Type an internal note, the customer won\'t see this message"]').value

                }
                else{
                       value = document.querySelector('[placeholder="Type a message"]').value
                }

        if(name==true){
          let comma = value[0]!=","?", ":"";
          if(massivEngl.includes(phrase[0].toUpperCase())){
            let transliterate = (
                            function() {
                                var
                               rus = "щ  ш  ч  ц  ю  я  ё  ж  ъ  ы  э  а б в г д е з и й к л м н о п р с т у ф х ь".split(/ +/g),
                                    eng = "shh sh ch cz yu ya yo zh `` y' e` a b v g d e z i j k l m n o p r s t u f x `".split(/ +/g)
                                ;
                                return function(text, engToRus) {
                                    var x;
                                    for(x = 0; x < rus.length; x++) {
                                        text = text.split(engToRus ? eng[x] : rus[x]).join(engToRus ? rus[x] : eng[x]);
                                        text = text.split(engToRus ? eng[x].toUpperCase() : rus[x].toUpperCase()).join(engToRus ? rus[x].toUpperCase() : eng[x].toUpperCase());
                                    }
                                    return text;
                                }
                            }
                        )();
                        let nameToType = transliterate(phrase,true);
                        nameToType = nameToType.charAt(0).toUpperCase() + nameToType.slice(1).toLowerCase();

             if(!document.querySelectorAll('[placeholder="Type a message"]')[0]){
                    document.querySelectorAll('[placeholder="Type an internal note, the customer won\'t see this message"]')[0].value = value.length>0?nameToType+ comma + value[0].toLowerCase()+ value.slice(1): nameToType +comma;

                }
                else{
                     document.querySelector('[placeholder="Type a message"]').value = value.length>0?nameToType+ comma + value[0].toLowerCase()+ value.slice(1): nameToType +comma;
                }



            return
          }

           if(!document.querySelectorAll('[placeholder="Type a message"]')[0]){
                    document.querySelectorAll('[placeholder="Type an internal note, the customer won\'t see this message"]')[0].value  = value.length>0?phrase.charAt(0).toUpperCase() + phrase.slice(1).toLowerCase()+ comma + value[0].toLowerCase()+ value.slice(1): phrase.charAt(0).toUpperCase() + phrase.slice(1).toLowerCase() +comma;

                }
                else{
                      document.querySelector('[placeholder="Type a message"]').value = value.length>0?phrase.charAt(0).toUpperCase() + phrase.slice(1).toLowerCase()+ comma + value[0].toLowerCase()+ value.slice(1): phrase.charAt(0).toUpperCase() + phrase.slice(1).toLowerCase() +comma;
                }

          return
        }
      if(!document.querySelectorAll('[placeholder="Type a message"]')[0]){
                    document.querySelectorAll('[placeholder="Type an internal note, the customer won\'t see this message"]')[0].value += phrase

                }
                else{
                     document.querySelector('[placeholder="Type a message"]').value += phrase
                }

    }

    async function onKeydown(evt) {
        switch (true){
          case evt.altKey && evt.keyCode == 81:
            await update(document.querySelector(".css-ensz22").innerText.split(" ")[0], true, true);
            break
          case evt.altKey && evt.keyCode == 87:
            await update("Мне необходимо несколько минут для уточнения информации. Оставайтесь в чате, пожалуйста.", false)
            break
              case evt.altKey && evt.keyCode == 90:
            await update("Благодарю за ожидание!", false)
            break
              case evt.altKey && evt.keyCode == 88:
            await update("Рада была вам помочь! 😊 Если возникнут вопросы, пожалуйста, обращайтесь.", false)
            break
    }

    }
    document.addEventListener('keydown', onKeydown, true);
})();// ==UserScript==
// @name        New script
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      -
// @description 23.12.2023, 13:21:41
// ==/UserScript==
