import defineAttributeMethods from '../utils/defineAttributeMethods';

// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
const ATTRIBUTES_SVG = 'accent-height accumulate additive alignment-baseline allowReorder alphabetic amplitude arabic-form ascent attributeName attributeType autoReverse azimuth baseFrequency baseline-shift baseProfile begin bias by calcMode cap-height class clipPathUnits clip-path clip-rule color color-interpolation color-interpolation-filters color-profile color-rendering contentScriptType contentStyleType cursor cx cy d decelerate descent diffuseConstant direction display divisor dominant-baseline dur dx dy edgeMode elevation enable-background end exponent externalResourcesRequired fill fill-opacity fill-rule filter filterUnits flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight format from fr fx fy g1 g2 gradientTransform gradientUnits hanging height href hreflang horiz-adv-x horiz-origin-x id ideographic image-rendering in in2 intercept k k1 k2 k3 k4 kernelMatrix kernelUnitLength kerning keyPoints keySplines keyTimes lang lengthAdjust letter-spacing lighting-color limitingConeAngle local marker-end marker-mid marker-start markerHeight markerUnits markerWidth mask maskContentUnits maskUnits mathematical max media method min mode name numOctaves offset opacity operator order orient orientation origin overflow overline-position overline-thickness panose-1 paint-order path pathLength patternContentUnits patternTransform patternUnits pointer-events points pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits r radius referrerPolicy refX refY rel rendering-intent repeatCount repeatDur requiredExtensions requiredFeatures restart result rotate rx ry scale seed shape-rendering slope spacing specularConstant specularExponent speed spreadMethod startOffset stdDeviation stemh stemv stitchTiles stop-color stop-opacity strikethrough-position strikethrough-thickness string stroke stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width style surfaceScale systemLanguage tabindex tableValues target targetX targetY text-anchor text-decoration text-rendering textLength to transform type u1 u2 underline-position underline-thickness unicode unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical values vector-effect version vert-adv-y vert-origin-x vert-origin-y viewBox viewTarget visibility width widths word-spacing writing-mode x x-height x1 x2 xChannelSelector xml:lang y y1 y2 yChannelSelector z zoomAndPan';

// Deprecated
// clip, filterRes, xlink:actuate, xlink:arcrole, xlink:href, xlink:role, xlink:show, xlink:title, xlink:type, xml:base, xml:space, glyph-name, glyph-orientation-horizontal, glyph-orientation-vertical, glyphRef, ping

// Conflicts with Pablo methods
// bbox

// To be removed, since animation elements removed
// Animation attributes target attributes:
// attributeType, attributeName

// Animation timing attributes:
// begin, dur, end, min, max, restart, repeatCount, repeatDur, fill

// Animation value attributes
// calcMode, values, keyTimes, keySplines, from, to, by, autoReverse, accelerate, decelerate

// Animation addition attributes
// additive, accumulate


defineAttributeMethods(ATTRIBUTES_SVG, 'svg');
