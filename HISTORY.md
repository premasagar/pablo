## 0.5.0
* Added viewbox()
* Revised stagger()
* Allow function values in transition(), transformCss(), transform()
* Update repo location

## 0.4.0
* Added Pablo.support
* Revised transition(), transformCss(), transform()

## 0.3.8
* Added transition() for CSS transitions
* Pass previous element to stagger() callback

## 0.3.7
* css() now autodetect's browser vendor-prefixes
* Removed cssPrefix()
* Added `Pablo.userAgent`
* Renamed `Pablo.v` to `Pablo.version`

## 0.3.6
* Escape Unicode on data URL creation


## 0.3.5
* Add withViewport()
* Rename Pablo.isHTMLDocument() to Pablo.isDocument()
* Add PNG / JPEG types to dataUrl() method
* Improve toImage() and toCanvas()


## 0.3.4
* Add dataUrl()
* Improve bbox(), toImage() and related methods


## 0.3.3
* Add bbox(), crop(), toImage(), toCanvas(), download(), stagger()
* Add `Pablo.support` for fine-grained environment capabilities detection
* Expose methods useful for advanced use or plugin writers
* Use native `DOMParser` / `XMLSerializer` under the hood for creation from markup and outputting to markup


## 0.3.2
* Add Pablo.get(), Pablo.load()
* Add load(), markup()


## 0.3.1
* Add Pablo.toSvg()
* Add Pablo.hasSvgNamespace()


## 0.3
* Rename root() to svg()
* Add traversal methods
* Add CSS selectors and selector functions as optional arguments to traversal methods
* Streamline code


## 0.2.0
* Move functional API to /extensions/functional.js
* Make DOM elements top-level in a collection, e.g. circle\[0\]
* Add numerous new methods


## 0.1.0
* Create Pablo
