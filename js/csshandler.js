/**
 * C S S  H A N D L E R  1.0
 * 
 * Created by Hegyközi Gergely (Leonuh)
 * Twitter: @leonuh
 * Email: leonuh@gmail.com
 * 
 * Replacable vars: $selector, $repeat, $delay, $counter
 */
(function() {

    /* Parser for the content */
    function parser(content) {

        var i,
            j,
            ch,
            selector,
            script,
            without_nr = content.replace(new RegExp("\n", "ig"), ''),
            matches = without_nr.match(new RegExp("[^}\\*\\/]*?{[^}]*?\\/\\*ch.*?\\*\\/.*?}", "ig"));

        /* Javascript Blocks */
        script = document.createElement('script');
        without_nr.replace(new RegExp("\\/\\*ch(.*?)ch\\*\\/", "ig"), function() {
            script.appendChild(document.createTextNode(arguments[1]));
        });
        document.getElementsByTagName('head')[0].appendChild(script);

        /* Rows */
        for(i in matches) {

            selector = matches[i].replace(new RegExp("(.*?){.*", "i"), '$1').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            ch = matches[i].match(new RegExp("\\/\\*ch.*?\\*\\/", "ig"));

            for(j in ch) {

                ch[j].replace(new RegExp("\\/\\*ch( (.*) (.*) (.*) )|( (.*) (.*) )|( (.*) )\\*\\/", "i"), function() {
                    var fn = '',
                        repeat = '0',
                        delay = '0';

                    if(checkPatternArgument(arguments[2]) && checkPatternArgument(arguments[3]) && checkPatternArgument(arguments[4])) {
                        fn = arguments[2];
                        repeat = arguments[3];
                        delay = arguments[4];
                    } else if(checkPatternArgument(arguments[6]) && checkPatternArgument(arguments[7])) {
                        fn = arguments[6];
                        repeat = arguments[7]; 
                    } else if(checkPatternArgument(arguments[9])) {
                        fn = arguments[9];
                    }

                    process(fn, repeat, delay, selector);

                });
            }
        }

        function checkPatternArgument(arg) {
            return (typeof arg != 'undefined' && arg.length != 0);
        }

    }

    /* Run the functions */
    function process(fn, repeat, delay, selector) {

        var intervalId,
            repeatCounter = 0;


        fn = fn.replace(/\$selector/ig, selector)
             .replace(/\$$repeat/ig, repeat)
             .replace(/\$$delay/ig, delay);

        //Delay
        intervalId = setInterval(function() {

            var fnFull = fn.replace(/\$counter/ig, repeatCounter);

            //Run fn
            eval(fnFull);

            //Repeat
            if(repeatCounter == repeat) {
                clearInterval(intervalId);
                return;
            }

            ++repeatCounter;

        }, delay);

    }

    /* Get content from link and style*/
    function packUp() {

        var i,
            link,
            linkCounter = 0,
            linkCounterLocal = 0,
            content = ''
            ;

        for(i in document.getElementsByTagName('link')) {
            link = document.getElementsByTagName('link')[i];
            if (typeof link != 'object') continue;

            ++linkCounterLocal;

            if(link.getAttribute('rel') == 'stylesheet') {
                httpRequest(link.getAttribute('href'));
            }
        }
        if(linkCounterLocal == 0) afterLink();

        //Private function for request
        function httpRequest(url) {
            var client = new XMLHttpRequest();
            client.onreadystatechange = function() {
                if (client.readyState === 4) {
                    ++linkCounter;
                    if(linkCounterLocal == linkCounter) afterLink();
                    else content += client.responseText;
                }
            }
            client.open("GET", url);
            client.send();
        }

        function afterLink() {
            for(i in document.getElementsByTagName('style')) {
                style = document.getElementsByTagName('style')[i];
                if (typeof style != 'object') continue;

                content += style.innerHTML;
            }

            parser(content);
        }

    }

    if (window.addEventListener) document.addEventListener("DOMContentLoaded", packUp, false);
    
})();