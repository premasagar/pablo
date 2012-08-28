---
category: reference
heading: 'Selection'
---

The `Pablo()` method call can be used to select multiple SVG elements.

`Pablo('lines')` will return a collection of all line elements.

Methods called on a collection will be applied to all elements within that 
collection.

    // Change all lines elements to be red
    Pablo('lines').attr({stroke: 'red'})

For more direct access to the elements you can use `.el` to obtain the 
HTML NodeList representation.

    Pablo('lines').el