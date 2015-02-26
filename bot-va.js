// ==UserScript==
// @name         Botva Userscript
// @namespace    http://botva.ru
// @version      0.2.5
// @description  Botva
// @author       Svel
// @match        http://g1.botva.ru/*
// @grant        none
// @downloadURL  http://svel.github.io/bot-va.js
// ==/UserScript==

var strLimit = 5500 / 100 * 80;
var minStr   = 500; // Минималка по силе для поиска в бодалке
var baseUri = 'http://g1.botva.ru';
var uri = {
    'profile': '/index.php',
    'dust': '/castle.php?a=workshop_mine',
    'attack': '/dozor.php',
    'mine': '/mine.php?a=open',
    'harbour': '/harbour.php?a=pier',
    'temple_service': '/temple.php?a=services'
};

(function(doc, localStorage){
    //localStorage.setItem('sv_bot', JSON.stringify(data));
    //console.log(localStorage.getItem('sv_bot'));
    //localStorage.setItem('sv_bot_action', 'unknown');

    function rnd(m, n) {
        m = parseInt(m);
        n = parseInt(n);
        return Math.floor(Math.random() * (n - m + 1)) + m;
    }
    function isArray(x)
    {
        return (x.constructor && x.constructor === Array);
    }

    /**
     * Смена кулона из панельки
     */
    function changeCoulon(id)
    {
        if (!isArray(id)) {
            //id = [id];
        }
        var coulon = $('#coulons_bar a').has('b.'+id);
        if (!coulon) { // нет в панельке, идём через инвентарь
        }
        if (coulon.hasClass('active')) {
            return; // Уже надет
        }
        setTimeout(coulon.trigger('click'), rnd(1500, 3000));
    }
    
    var jobStatus = $('#container #right .timers')[0].childNodes[0].nodeValue.trim();
    var dangerStatus = (null === $('#container #right .timers')[0].childNodes[3].childNodes[0].nodeValue ? $($('#container #right .timers')[0].childNodes[3].childNodes[0]).text().trim() : $('#container #right .timers')[0].childNodes[3].childNodes[0].nodeValue.trim());
    var attackStatus = $('#container #right .timers a.attack').text().trim();

    // Атака на арене
    if (('Текущая работа' == jobStatus) && (-1 < window.location.href.indexOf(uri.attack))) {
        var searchButton = $('#content a[href^="/dozor.php?m=arena&"]:contains("ПОИСК:")').eq(0);
        if ((0 < searchButton.length) && searchButton.is(':visible') && (3 == searchButton.find('b').text().trim())) {
            changeCoulon('item_633');// Разрушитель
            changeCoulon('item_816');// Колосс
            console.log('Search Arena');
            window.location = baseUri + searchButton.attr('href');
            return;
        } else if ((0 < $('#content a.arena_enemy').length)) {
            var enemies = $('#content a.arena_enemy');
            console.log('Selecting enemy from set of ' + enemies.length);
            var enemySet = [];
            for (var i=0;i<enemies.length;i++) {
                enemySet.push(
                    intval(
                        enemies.eq(i).find('.arena_enemy_stat div').eq(1)[0].childNodes[0].nodeValue.trim().replace(/\./g, '')
                    )
                );
            }
            // Attacking by lowest battle rate
            // not working: enemies.eq(enemySet.indexOf(Math.min.apply(Math, enemySet))).trigger('click');
            enemies.eq(enemySet.indexOf(Math.min.apply(Math, enemySet)))[0].click();
            // or window.location = baseUri + enemies.eq(enemySet.indexOf(Math.min.apply(Math, enemySet))).attr('href');
            return;
        } else if (-1 < window.location.href.indexOf(uri.attack + '?m=arena&a=log')) {
            window.location = baseUri + uri.profile;
            return;
        }
        /*
         * $('#content a.arena_enemy')
         * .find('.arena_enemy_stat div').eq().childNodes[0].nodeValue.trim()
         * intval('12.345'.replace(/\./g, ''));
         * 
         * Sorting: http://jsfiddle.net/xsM5s/16/
         */
    }

    // Страшилка ( http://g1.botva.ru/dozor.php?a=monster )
    if (('Текущая работа' == jobStatus) && (-1 < window.location.href.indexOf(uri.attack))) {
        if ($('#content td.half').eq(3).not(':has(.watch_no_monster)') && $('#content td.half').eq(3).has('form') && $('#content td.half').eq(3).find('form input[type="submit"]').is(':visible')) {
            changeCoulon('item_633');// Разрушитель
            changeCoulon('item_816');// Колосс
            // Питомец
            if ((0 < $('#top_menu #pet').eq(0).has('.ico_cage_2').length) && (2 < $('#top_menu #pet .ico_cage_2').length) && (0 < $('#top_menu #pet').eq(0).has('.name .pet7').length)) {
                $('#top_menu #pet .ico_cage_2')[0].click();
                setTimeout(function(){
                    $('#mobile_pet_pricebtn')[0].click();
                }, rnd(1500, 2500));
                return;
            } else if (0 < $('#content td.half').length) { // Искать
                $('#content td.half').eq(3).find('form input[type="submit"]').trigger('click');
                return;
            }
        } else if (-1 < window.location.href.indexOf(uri.attack + '?a=monster')) { // Напасть
            $('#content input[type="submit"]').filter(function(index) { return $(this).attr('value') === "НАПАСТЬ"; }).trigger('click');
            $('#content form input[type="submit"]').filter(function(index) { return $(this).attr('value') === "НАПАСТЬ"; }).trigger('click');
            return;
        }
    }

    // Свободен для атаки
    if (('Текущая работа' == jobStatus) && ('Пора в бой!' == attackStatus || '00:00:00' == attackStatus)) {
        if (-1 === window.location.href.indexOf(uri.attack)) {
            window.location = baseUri + uri.attack;
            return;
        } else {
            if ((0 < $('#top_menu #pet').eq(0).has('.ico_cage_2').length) && (2 < $('#top_menu #pet .ico_cage_2').length) && (0 < $('#top_menu #pet').eq(0).has('.name .pet7').length)) {
                $('#top_menu #pet .ico_cage_2')[0].click();
                setTimeout(function(){
                    $('#mobile_pet_pricebtn')[0].click();
                }, rnd(1500, 2500));
                return;
            } else if ($('#content #watch_find').is(':visible')) {
                changeCoulon('item_225'); // Кристахап
                setTimeout(function() {
                    $('#content #watch_find').trigger('click');
                }, rnd(500, 1500));
                return;
            } else if (
                (
                    $('#content form input[type="submit"]')
                    .filter(function(index) {
                        return ($(this).attr('value') === "НАПАСТЬ");
                    })
                    .length
                ) > 0
            ) {
                if ((parseInt($('#ability_training .ability .value1').eq(0).text()) < strLimit) && (parseInt($('#ability_training .ability .value1').eq(0).text()) >= minStr)) {
                    $('#content form input[type="submit"]').filter(function(index) { return $(this).attr('value') === "НАПАСТЬ"; }).trigger('click');
                    return;
                } else {
                    $('#content form input[type="submit"]').filter(function(index) { return $(this).attr('value') === "НОВЫЙ ПОИСК"; }).trigger('click');
                    return;
                }
            }
        }
        return;
    }

    // Убрать зверя
    if ((0 < $('#top_menu #pet').eq(0).has('.ico_cage_1').length) && ((intval($('#top_menu #pet i').text()) > 90) || ((dangerStatus === 'Я в опасности!') && !(intval($('#top_menu #pet i').text()) < 90)))) {
        $('#top_menu #pet .ico_cage_1')[0].click();
        setTimeout(function(){
            $('#mobile_pet_pricebtn')[0].click();
        }, rnd(1500, 2000));
        return;
    }

    // Шахта
    if (('Текущая работа' == jobStatus)) {
        if (-1 === window.location.href.indexOf(uri.mine)) {
            changeCoulon('item_104'); // Копик
            window.location = baseUri + uri.mine;
            return;
        } else { // Шахтёрим
            if ($('#content #mine_form').is(':visible')) {
                $('#content #mine_form input[type="submit"]').trigger('click');
                return;
            }
        }
    }
    if ('Работа в карьере' == jobStatus) {
        // Выкапываем
        if ($('a').filter(function(index) { return $(this).text() === "ДОБЫТЬ"; }).length > 0) {
            window.location = baseUri + '/' + $('a').filter(function(index) { return $(this).text() === "ДОБЫТЬ"; }).attr('href');
            return;
        } else { // Атакуем
        }
    }

    // Валентинки
    if ($('#valentine_2015_heart').length > 0) {
        $('#valentine_2015_heart').trigger('click');
    }
    
    // Пыль
    if (-1 <  window.location.href.indexOf(baseUri + '/castle.php?a=workshop_mine')) {
        console.log('Молоть пыль');
        if (!$('#content #form_workshop').find('#ws_work').is(':visible')) {
            $('#content #form_workshop #ws_none input[type="submit"]').trigger('click');
        } else {
        }
        localStorage.setItem('sv_bot_work_mine_timeout', Date.now());
        window.location = baseUri + uri.mine;
        return;
    }
    
    // Кораблик
    if (-1 <  window.location.href.indexOf(baseUri + uri.harbour)) {
        if ($('#content .send_ship form input[type="submit"]').eq(0).is(':visible')) {
            console.log('Плыть');
            $('#content .send_ship form input[type="submit"]').eq(0).trigger('click');
        } else {
        }
        localStorage.setItem('sv_bot_harbour_timeout', Date.now());
        setTimeout(function(){ window.location = baseUri + uri.mine; }, 1000);
        return;
    }

    // Снять эффекты
    if (-1 <  window.location.href.indexOf(baseUri + uri.temple_service)) {
        if (0 < $('#content #temple_remove_block form input[type="checkbox"][name="effect[]"]').length) {
            if (0 < $('#content #temple_remove_block form #shaman_118').length) { // Золото
                $('#content #temple_remove_block form label[for="shaman_118"] img').eq(0).trigger('click');
            }
            if (0 < $('#content #temple_remove_block form #shaman_122').length) { // Антикрут
                $('#content #temple_remove_block form label[for="shaman_122"] img').eq(0).trigger('click');
            }
            if (0 < $('#content #temple_remove_block form #shaman_109').length) { // Отравка
                $('#content #temple_remove_block form label[for="shaman_109"] img').eq(0).trigger('click');
            }
            if (0 < $('#content #temple_remove_block form #shaman_106').length) { // Оглушка
                $('#content #temple_remove_block form label[for="shaman_106"] img').eq(0).trigger('click');
            }
            if ($('#content #removePrice input').attr('value')) {
                localStorage.setItem('sv_bot_temple_timeout', Date.now());
                if (0 < intval($('#content #temple_remove_block form #removePrice .price_num_crystal').text())) {
                	$('#content #temple_remove_block form input[type="submit"]').trigger('click');
                }
            }
        }
        setTimeout(function(){ window.location = baseUri + uri.mine; }, rnd(1500, 3000));
        return;
    }

    // Возврат в копалку после снятия отрицаловки
    if ((window.location.href == baseUri + '/temple.php') && ((intval(localStorage.getItem('sv_bot_temple_timeout')) + (30*1000)) >= (intval(Date.now())))) {
        setTimeout(function(){ window.location = baseUri + uri.mine; }, rnd(1500, 3000));
        return;
    }

    var petBlock = $('#right #rmenu2 .flyings');
    console.log(petBlock.children().length);
    /*
    for (petBlock) {
    }
    */

    // Ги-задания, что бы подцепить их
    if (-1 <  window.location.href.indexOf(baseUri + '/clan_mod.php?m=task')) {
        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        date.setDate(date.getDate()+1);
        date.setMinutes(10);
        localStorage.setItem('sv_bot_clan_task_timeout', (date.getTime()));
        setTimeout(function(){ window.location = baseUri + uri.mine; }, rnd(4500, 5500));
        return;
    }

    // Напоминания
    $('#right #rmenu2 #events_scroll a').each(function(e){
        // Отрицаловки снять
        if ((0 === $(this).attr('href').indexOf(uri.temple_service)) && (-1 === window.location.href.indexOf(uri.temple_service)) && ((intval(localStorage.getItem('sv_bot_temple_timeout')) + (60*5*1000)) < (intval(Date.now())))) {
            console.log('Going to temple page');
            window.location = baseUri + $(this).attr('href');
            return;
        }
        // Кораблик
        if ((0 === $(this).attr('href').indexOf(uri.harbour)) && (-1 === window.location.href.indexOf(uri.harbour)) && ((intval(localStorage.getItem('sv_bot_harbour_timeout')) + (60*1000)) < (intval(Date.now())))) {
            console.log('Going to harbour page');
            window.location = baseUri + $(this).attr('href');
            return;
        }
        // Пыль
        if ((0 === $(this).attr('href').indexOf(uri.dust)) && (-1 === window.location.href.indexOf('castle.php?a=workshop_mine')) && ((intval(localStorage.getItem('sv_bot_work_mine_timeout')) + (20*1000)) < (intval(Date.now())))) {
            console.log('Going to dust page');
            window.location = baseUri + $(this).attr('href');
            return;
        }
        // Звери - летунчики
        if ((0 === $(this).attr('href').indexOf('/castle.php?a=zoo')) && (-1 === window.location.href.indexOf('/castle.php?a=zoo'))) {
            console.log('Идти на страницу петов-летунов');
            return;
        }
        // Зайти в ги-задания, что бы подцепить их
        if ((0 === $(this).attr('href').indexOf('/clan_mod.php?m=task')) && (-1 === window.location.href.indexOf('/clan_mod.php?m=task')) && (intval(localStorage.getItem('sv_bot_clan_task_timeout')) < (intval(Date.now())))) {
            console.log('Going to dust page');
            window.location = baseUri + $(this).attr('href');
            return;
        }
    });

    // Переключение петов: $('#flyings .flying32').trigger('click');
})(document, localStorage);
