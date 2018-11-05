# Method name conflicts

## SVG attribute conflicts with Array methods
`filter`
- use Array#filter when argument is a function or selector string
- element allowed on svg namespace elements
- attribute not used on html elements; css is used instead
- element allowed on svg `<svg>`, `<defs>`, `<switch>`
- attribute has effect on `<a>`, `<defs>`, `<glyph>`, `<g>`, `<marker>`, `<missing-glyph>`, `<pattern>`, `<svg>`, `<switch>`, `<symbol>`, `<circle>`, `<ellipse>`, `<image>`, `<line>`, `<mesh>`, `<path>`, `<polygon>`, `<polyline>`, `<rect>`, `<text>`, `<use>`

`fill`
- attribute used on animation elements [may be deprecated]
- use attribute if argument is undefined or an object
- use Array#fill when argument is an element name (string) [and optional second argument `attr`], or element/node

`values`
- attribute used in `<feColorMatrix>` and animation elements
- array method returns an iterator, where the Pablo collection itself is iterable, so not very useful

## SVG attribute conflicts with SVG elements
`mask`
- element allowed on svg `<svg>`, `<defs>`, `<switch>`
- attribute allowed on other elements
- (attribute's effect is seen on svg `<a>`, `<circle>`, `<clipPath>`, `<ellipse>`, `<g>`, `<glyph>`, `<image>`, `<line>`, `<marker>`, `<mask>`, `<path>`, `<pattern>`, `<polygon>`, `<polyline>`, `<rect>`, `<svg>`, `<symbol>`, `<text>`, `<use>`)

`path`
- attribute allowed on svg `<animateMotion>` – https://svgwg.org/specs/animations/#AnimateMotionElementPathAttribute

`style`
- element allowed on html `<head>` or descendents


## HTML element conflicts with Array methods
`map`
- create element if argument is undefined or an object


## HTML element conflicts with SVG elements
`a` already exists (svg element)
`script` already exists (svg element)
`style` already exists (svg element)
`title` already exists (svg element)


## HTML attribute conflicts with HTML elements
`cite`
- attribute allowed on html `<blockquote>`, `<del>`, `<ins>`, `<q>`

`code`
- attribute used on html `<applet>`, which is deprecated

`data`
- attribute allowed on html `<object>`

`form`
- attribute allowed on html `<button>`, `<fieldset>`, `<input>`, `<keygen>`, `<label>`, `<meter>`, `<object>`, `<output>`, `<progress>`, `<select>`, `<textarea>`

`label`
- attribute allowed on html `<track>`

`slot`
- element is a descendent of html `<template>`
- attribute is on a descendent of a custom element – https://stackoverflow.com/questions/43211025/check-if-dom-element-is-native-no-custom-element/43218577
-- isCustomElement === elementName.indexOf('-') !== 0 && !!customElements.get(elementName)
-- valid custom element name is hyphenated and not `annotation-xml`, `color-profile`, `font-face`, `font-face-src`, `font-face-uri`, `font-face-format`, `font-face-name`, `missing-glyph` – https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name

`span`
- attribute allowed on html `<col>`, `<colgroup>`

`summary`
- attribute allowed on html `<table>`


## HTML attribute conflicts with Pablo methods
`content`
- attribute allowed on html `<meta>`
- otherwise, set text content

## HTML attribute conflicts with SVG elements
`pattern`
- attribute allowed on html `<input>`
- use attribute in html and element in svg

`style`
- element allowed on html `<head>`, `<body>` and svg `<svg>`

`title`
- element allowed on `<head>` or descendent


## Other collections
- MathML
-- https://www.w3.org/TR/MathML3/appendixi.html#index.elem
-- https://www.w3.org/TR/MathML3/appendixi.html#index.att
- Custom libraries
