import defineElementMethods from '../utils/defineElementMethods';

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element
const ELEMENTS_HTML = 'a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p param picture pre progress q rb rp rt rtc ruby s samp script section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr';

// Deprecated
// https://www.tutorialspoint.com/html5/html5_deprecated_tags.htm
// acronym, applet, basefont, bgsound, big, blink, center, command, content, dir,
// element, font, frame, frameset, image, isindex, keygen, listing, marquee,
// menuitem, multicol, nextid, nobr, noembed, noframes, plaintext, shadow,
// spacer, strike, tt, xmp

defineElementMethods(ELEMENTS_HTML, 'html');
