import defineElementMethods from '../utils/defineElementMethods';

// https://www.w3.org/TR/SVG2/
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
const ELEMENTS_SVG = 'a circle clipPath defs desc discard ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feDropShadow feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter foreignObject g hatch hatchpath image line linearGradient marker mask mesh meshgradient meshpatch meshrow metadata mpath path pattern polygon polyline radialGradient rect script solidcolor stop style svg switch symbol text textPath title tspan unknown use view';

// Deprecated
// https://stackoverflow.com/questions/34352624/alternative-for-deprecated-svg-pathseglist
// altGlyph, altGlyphDef, altGlyphItem, cursor, font, font-face, font-face-format, font-face-name, font-face-src, font-face-uri, glyph, glyphRef, hkern, missing-glyph, tref, vkern

// Animation elements likely to be deprecated
// animate, animateColor, animateMotion, animateTransform, mpath, set

// Element replaced by CSS, likely to be deprecated
// color-profile

defineElementMethods(ELEMENTS_SVG, 'svg');
