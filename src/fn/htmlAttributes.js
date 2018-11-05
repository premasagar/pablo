import defineAttributeMethods from '../utils/defineAttributeMethods';

// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
const ATTRIBUTES_HTML = 'accept accept-charset accesskey action allow alt async autocapitalize autocomplete autofocus autoplay buffered challenge charset checked cite class code codebase cols colspan content contenteditable contextmenu controls coords crossorigin data datetime decoding default defer dir dirname disabled download draggable dropzone enctype for form formaction headers height hidden high href hreflang http-equiv icon id importance integrity is ismap itemid itemprop itemref itemscope itemtype keytype kind label lang language lazyload list loop low manifest max maxlength minlength media method min multiple muted name novalidate open optimum pattern placeholder poster preload radiogroup readonly rel required reversed rows rowspan sandbox scope scoped selected shape size sizes slot span spellcheck src srcdoc srclang srcset start step style tabindex target title translate type usemap value width wrap';

// Deprecated
// align, bgcolor, border, color, ping, summary

defineAttributeMethods(ATTRIBUTES_HTML, 'html');
