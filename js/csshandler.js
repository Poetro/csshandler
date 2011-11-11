/**
 * C S S  H A N D L E R  1.0
 *
 * Created by Hegyközi Gergely (Leonuh)
 * Twitter: @leonuh
 * Email: leonuh@gmail.com
 *
 * Replacable vars: $selector, $repeat, $delay, $counter
 */
(function(doc) {

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
            if(repeatCounter === repeat) {
                clearInterval(intervalId);
                return;
            }

            ++repeatCounter;

        }, delay);

    }

    /* Parser for the content */
    function parser(content) {

        var i,
            j,
            ml,
            cl,
            ch,
            selector,
            script,
            without_nr = content.replace(new RegExp("\n", "ig"), ''),
            matches = without_nr.match(new RegExp("[^}\\*\\/]*?{[^}]*?\\/\\*ch.*?\\*\\/.*?}", "ig"));


        function checkPatternArgument(arg) {
            return (typeof arg !== 'undefined' && arg.length !== 0);
        }

        function replacePattern(match) {
            var fn = '',
                repeat = 0,
                delay = 0,
                args = Array.prototype.slice.call(arguments);

            if(checkPatternArgument(args[2]) && checkPatternArgument(args[3]) && checkPatternArgument(args[4])) {
                fn = args[2];
                repeat = args[3];
                delay = args[4];
            } else if(checkPatternArgument(args[6]) && checkPatternArgument(args[7])) {
                fn = args[6];
                repeat = args[7];
            } else if(checkPatternArgument(args[9])) {
                fn = args[9];
            }

            // Convert repeat and delay to number.
            return process(fn, +repeat, +delay, selector);
        }

        /* Javascript Blocks */
        script = doc.createElement('script');
        without_nr.replace(new RegExp("\\/\\*ch(.*?)ch\\*\\/", "ig"), function() {
            script.appendChild(doc.createTextNode(arguments[1]));
        });
        doc.getElementsByTagName('head')[0].appendChild(script);

        /* Rows */
        for(i = 0, ml = matches.length; i < ml; i += 1) {

            selector = matches[i].replace(new RegExp("(.*?){.*", "i"), '$1').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            ch = matches[i].match(new RegExp("\\/\\*ch.*?\\*\\/", "ig"));

            for(j = 0, cl = ch.length; j < cl; j += 1) {

                ch[j].replace(new RegExp("\\/\\*ch( (.*) (.*) (.*) )|( (.*) (.*) )|( (.*) )\\*\\/", "i"), replacePattern);
            }
        }
    }

    /* Get content from link and style*/
    function packUp() {

        var links = doc.getElementsByTagName('link'),
            i = 0,
            l = links.length,
            link,
            linkCounter = 0,
            linkCounterLocal = 0,
            content = '';


        function afterLink() {
            var styles = doc.getElementsByTagName('style'),
                style,
                i = 0,
                l = styles.length;
            for(; i < l; i += 1) {
                style = styles[i];
                if (typeof style !== 'object') {
                    continue;
                }

                content += style.innerHTML;
            }

            parser(content);
        }

        //Private function for request
        function httpRequest(url) {
            var client = new XMLHttpRequest();
            client.onreadystatechange = function() {
                if (client.readyState === 4) {
                    ++linkCounter;
                    if(linkCounterLocal === linkCounter) {
                        afterLink();
                    }
                    else {
                        content += client.responseText;
                    }
                }
            };
            client.open("GET", url);
            client.send();
        }

        for(; i < l; i += 1) {
            link = links[i];
            if (typeof link !== 'object') {
                continue;
            }

            ++linkCounterLocal;

            if(link.getAttribute('rel') === 'stylesheet') {
                httpRequest(link.getAttribute('href'));
            }
        }
        if(linkCounterLocal === 0) {
            afterLink();
        }
    }

    if (window.addEventListener) {
        doc.addEventListener("DOMContentLoaded", packUp, false);
    }

}(document));
