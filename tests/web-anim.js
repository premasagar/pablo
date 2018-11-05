import window from './window';

const { document, performance, Event } = window;
const WEB_ANIMATIONS_TESTING = false;

function isNodeJS () {
  if (typeof process === 'object') {
    if (typeof process.versions === 'object') {
      if (typeof process.versions.node !== 'undefined') {
        return true;
      }
    }
  }

  return false;
}


// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

var webAnimationsShared = {};

var webAnimations1 = {};

var webAnimationsNext = {};

if (!WEB_ANIMATIONS_TESTING) var webAnimationsTesting = null;

(function(shared, testing) {
    var fills = "backwards|forwards|both|none".split("|");
    var directions = "reverse|alternate|alternate-reverse".split("|");
    var linear = function(x) {
        return x;
    };
    function cloneTimingInput(timingInput) {
        if (typeof timingInput == "number") {
            return timingInput;
        }
        var clone = {};
        for (var m in timingInput) {
            clone[m] = timingInput[m];
        }
        return clone;
    }
    function AnimationEffectTiming() {
        this._delay = 0;
        this._endDelay = 0;
        this._fill = "none";
        this._iterationStart = 0;
        this._iterations = 1;
        this._duration = 0;
        this._playbackRate = 1;
        this._direction = "normal";
        this._easing = "linear";
        this._easingFunction = linear;
    }
    function isInvalidTimingDeprecated() {
        return shared.isDeprecated("Invalid timing inputs", "2016-03-02", "TypeError exceptions will be thrown instead.", true);
    }
    AnimationEffectTiming.prototype = {
        _setMember: function(member, value) {
            this["_" + member] = value;
            if (this._effect) {
                this._effect._timingInput[member] = value;
                this._effect._timing = shared.normalizeTimingInput(this._effect._timingInput);
                this._effect.activeDuration = shared.calculateActiveDuration(this._effect._timing);
                if (this._effect._animation) {
                    this._effect._animation._rebuildUnderlyingAnimation();
                }
            }
        },
        get playbackRate() {
            return this._playbackRate;
        },
        set delay(value) {
            this._setMember("delay", value);
        },
        get delay() {
            return this._delay;
        },
        set endDelay(value) {
            this._setMember("endDelay", value);
        },
        get endDelay() {
            return this._endDelay;
        },
        set fill(value) {
            this._setMember("fill", value);
        },
        get fill() {
            return this._fill;
        },
        set iterationStart(value) {
            if ((isNaN(value) || value < 0) && isInvalidTimingDeprecated()) {
                throw new TypeError("iterationStart must be a non-negative number, received: " + timing.iterationStart);
            }
            this._setMember("iterationStart", value);
        },
        get iterationStart() {
            return this._iterationStart;
        },
        set duration(value) {
            if (value != "auto" && (isNaN(value) || value < 0) && isInvalidTimingDeprecated()) {
                throw new TypeError("duration must be non-negative or auto, received: " + value);
            }
            this._setMember("duration", value);
        },
        get duration() {
            return this._duration;
        },
        set direction(value) {
            this._setMember("direction", value);
        },
        get direction() {
            return this._direction;
        },
        set easing(value) {
            this._easingFunction = parseEasingFunction(normalizeEasing(value));
            this._setMember("easing", value);
        },
        get easing() {
            return this._easing;
        },
        set iterations(value) {
            if ((isNaN(value) || value < 0) && isInvalidTimingDeprecated()) {
                throw new TypeError("iterations must be non-negative, received: " + value);
            }
            this._setMember("iterations", value);
        },
        get iterations() {
            return this._iterations;
        }
    };
    function makeTiming(timingInput, forGroup, effect) {
        var timing = new AnimationEffectTiming();
        if (forGroup) {
            timing.fill = "both";
            timing.duration = "auto";
        }
        if (typeof timingInput == "number" && !isNaN(timingInput)) {
            timing.duration = timingInput;
        } else if (timingInput !== undefined) {
            Object.getOwnPropertyNames(timingInput).forEach(function(property) {
                if (timingInput[property] != "auto") {
                    if (typeof timing[property] == "number" || property == "duration") {
                        if (typeof timingInput[property] != "number" || isNaN(timingInput[property])) {
                            return;
                        }
                    }
                    if (property == "fill" && fills.indexOf(timingInput[property]) == -1) {
                        return;
                    }
                    if (property == "direction" && directions.indexOf(timingInput[property]) == -1) {
                        return;
                    }
                    if (property == "playbackRate" && timingInput[property] !== 1 && shared.isDeprecated("AnimationEffectTiming.playbackRate", "2014-11-28", "Use Animation.playbackRate instead.")) {
                        return;
                    }
                    timing[property] = timingInput[property];
                }
            });
        }
        return timing;
    }
    function numericTimingToObject(timingInput) {
        if (typeof timingInput == "number") {
            if (isNaN(timingInput)) {
                timingInput = {
                    duration: 0
                };
            } else {
                timingInput = {
                    duration: timingInput
                };
            }
        }
        return timingInput;
    }
    function normalizeTimingInput(timingInput, forGroup) {
        timingInput = shared.numericTimingToObject(timingInput);
        return makeTiming(timingInput, forGroup);
    }
    function cubic(a, b, c, d) {
        if (a < 0 || a > 1 || c < 0 || c > 1) {
            return linear;
        }
        return function(x) {
            if (x <= 0) {
                var start_gradient = 0;
                if (a > 0) start_gradient = b / a; else if (!b && c > 0) start_gradient = d / c;
                return start_gradient * x;
            }
            if (x >= 1) {
                var end_gradient = 0;
                if (c < 1) end_gradient = (d - 1) / (c - 1); else if (c == 1 && a < 1) end_gradient = (b - 1) / (a - 1);
                return 1 + end_gradient * (x - 1);
            }
            var start = 0, end = 1;
            while (start < end) {
                var mid = (start + end) / 2;
                function f(a, b, m) {
                    return 3 * a * (1 - m) * (1 - m) * m + 3 * b * (1 - m) * m * m + m * m * m;
                }
                var xEst = f(a, c, mid);
                if (Math.abs(x - xEst) < 1e-5) {
                    return f(b, d, mid);
                }
                if (xEst < x) {
                    start = mid;
                } else {
                    end = mid;
                }
            }
            return f(b, d, mid);
        };
    }
    var Start = 1;
    var Middle = .5;
    var End = 0;
    function step(count, pos) {
        return function(x) {
            if (x >= 1) {
                return 1;
            }
            var stepSize = 1 / count;
            x += pos * stepSize;
            return x - x % stepSize;
        };
    }
    var presets = {
        ease: cubic(.25, .1, .25, 1),
        "ease-in": cubic(.42, 0, 1, 1),
        "ease-out": cubic(0, 0, .58, 1),
        "ease-in-out": cubic(.42, 0, .58, 1),
        "step-start": step(1, Start),
        "step-middle": step(1, Middle),
        "step-end": step(1, End)
    };
    var styleForCleaning = null;
    var numberString = "\\s*(-?\\d+\\.?\\d*|-?\\.\\d+)\\s*";
    var cubicBezierRe = new RegExp("cubic-bezier\\(" + numberString + "," + numberString + "," + numberString + "," + numberString + "\\)");
    var stepRe = /steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/;
    function normalizeEasing(easing) {
        if (!styleForCleaning) {
            styleForCleaning = document.createElement("div").style;
        }
        styleForCleaning.animationTimingFunction = "";
        styleForCleaning.animationTimingFunction = easing;
        var normalizedEasing = styleForCleaning.animationTimingFunction;
        if (normalizedEasing == "" && isInvalidTimingDeprecated()) {
            throw new TypeError(easing + " is not a valid value for easing");
        }
        return normalizedEasing;
    }
    function parseEasingFunction(normalizedEasing) {
        if (normalizedEasing == "linear") {
            return linear;
        }
        var cubicData = cubicBezierRe.exec(normalizedEasing);
        if (cubicData) {
            return cubic.apply(this, cubicData.slice(1).map(Number));
        }
        var stepData = stepRe.exec(normalizedEasing);
        if (stepData) {
            return step(Number(stepData[1]), {
                start: Start,
                middle: Middle,
                end: End
            }[stepData[2]]);
        }
        var preset = presets[normalizedEasing];
        if (preset) {
            return preset;
        }
        return linear;
    }
    function calculateActiveDuration(timing) {
        return Math.abs(repeatedDuration(timing) / timing.playbackRate);
    }
    function repeatedDuration(timing) {
        if (timing.duration === 0 || timing.iterations === 0) {
            return 0;
        }
        return timing.duration * timing.iterations;
    }
    var PhaseNone = 0;
    var PhaseBefore = 1;
    var PhaseAfter = 2;
    var PhaseActive = 3;
    function calculatePhase(activeDuration, localTime, timing) {
        if (localTime == null) {
            return PhaseNone;
        }
        var endTime = timing.delay + activeDuration + timing.endDelay;
        if (localTime < Math.min(timing.delay, endTime)) {
            return PhaseBefore;
        }
        if (localTime >= Math.min(timing.delay + activeDuration, endTime)) {
            return PhaseAfter;
        }
        return PhaseActive;
    }
    function calculateActiveTime(activeDuration, fillMode, localTime, phase, delay) {
        switch (phase) {
          case PhaseBefore:
            if (fillMode == "backwards" || fillMode == "both") return 0;
            return null;

          case PhaseActive:
            return localTime - delay;

          case PhaseAfter:
            if (fillMode == "forwards" || fillMode == "both") return activeDuration;
            return null;

          case PhaseNone:
            return null;
        }
    }
    function calculateOverallProgress(iterationDuration, phase, iterations, activeTime, iterationStart) {
        var overallProgress = iterationStart;
        if (iterationDuration === 0) {
            if (phase !== PhaseBefore) {
                overallProgress += iterations;
            }
        } else {
            overallProgress += activeTime / iterationDuration;
        }
        return overallProgress;
    }
    function calculateSimpleIterationProgress(overallProgress, iterationStart, phase, iterations, activeTime, iterationDuration) {
        var simpleIterationProgress = overallProgress === Infinity ? iterationStart % 1 : overallProgress % 1;
        if (simpleIterationProgress === 0 && phase === PhaseAfter && iterations !== 0 && (activeTime !== 0 || iterationDuration === 0)) {
            simpleIterationProgress = 1;
        }
        return simpleIterationProgress;
    }
    function calculateCurrentIteration(phase, iterations, simpleIterationProgress, overallProgress) {
        if (phase === PhaseAfter && iterations === Infinity) {
            return Infinity;
        }
        if (simpleIterationProgress === 1) {
            return Math.floor(overallProgress) - 1;
        }
        return Math.floor(overallProgress);
    }
    function calculateDirectedProgress(playbackDirection, currentIteration, simpleIterationProgress) {
        var currentDirection = playbackDirection;
        if (playbackDirection !== "normal" && playbackDirection !== "reverse") {
            var d = currentIteration;
            if (playbackDirection === "alternate-reverse") {
                d += 1;
            }
            currentDirection = "normal";
            if (d !== Infinity && d % 2 !== 0) {
                currentDirection = "reverse";
            }
        }
        if (currentDirection === "normal") {
            return simpleIterationProgress;
        }
        return 1 - simpleIterationProgress;
    }
    function calculateIterationProgress(activeDuration, localTime, timing) {
        var phase = calculatePhase(activeDuration, localTime, timing);
        var activeTime = calculateActiveTime(activeDuration, timing.fill, localTime, phase, timing.delay);
        if (activeTime === null) return null;
        var overallProgress = calculateOverallProgress(timing.duration, phase, timing.iterations, activeTime, timing.iterationStart);
        var simpleIterationProgress = calculateSimpleIterationProgress(overallProgress, timing.iterationStart, phase, timing.iterations, activeTime, timing.duration);
        var currentIteration = calculateCurrentIteration(phase, timing.iterations, simpleIterationProgress, overallProgress);
        var directedProgress = calculateDirectedProgress(timing.direction, currentIteration, simpleIterationProgress);
        return timing._easingFunction(directedProgress);
    }
    shared.cloneTimingInput = cloneTimingInput;
    shared.makeTiming = makeTiming;
    shared.numericTimingToObject = numericTimingToObject;
    shared.normalizeTimingInput = normalizeTimingInput;
    shared.calculateActiveDuration = calculateActiveDuration;
    shared.calculateIterationProgress = calculateIterationProgress;
    shared.calculatePhase = calculatePhase;
    shared.normalizeEasing = normalizeEasing;
    shared.parseEasingFunction = parseEasingFunction;
    if (WEB_ANIMATIONS_TESTING) {
        testing.normalizeTimingInput = normalizeTimingInput;
        testing.normalizeEasing = normalizeEasing;
        testing.parseEasingFunction = parseEasingFunction;
        testing.calculateActiveDuration = calculateActiveDuration;
        testing.calculatePhase = calculatePhase;
        testing.PhaseNone = PhaseNone;
        testing.PhaseBefore = PhaseBefore;
        testing.PhaseActive = PhaseActive;
        testing.PhaseAfter = PhaseAfter;
    }
})(webAnimationsShared, webAnimationsTesting);

(function(shared, testing) {
    var shorthandToLonghand = {
        background: [ "backgroundImage", "backgroundPosition", "backgroundSize", "backgroundRepeat", "backgroundAttachment", "backgroundOrigin", "backgroundClip", "backgroundColor" ],
        border: [ "borderTopColor", "borderTopStyle", "borderTopWidth", "borderRightColor", "borderRightStyle", "borderRightWidth", "borderBottomColor", "borderBottomStyle", "borderBottomWidth", "borderLeftColor", "borderLeftStyle", "borderLeftWidth" ],
        borderBottom: [ "borderBottomWidth", "borderBottomStyle", "borderBottomColor" ],
        borderColor: [ "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor" ],
        borderLeft: [ "borderLeftWidth", "borderLeftStyle", "borderLeftColor" ],
        borderRadius: [ "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius" ],
        borderRight: [ "borderRightWidth", "borderRightStyle", "borderRightColor" ],
        borderTop: [ "borderTopWidth", "borderTopStyle", "borderTopColor" ],
        borderWidth: [ "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth" ],
        flex: [ "flexGrow", "flexShrink", "flexBasis" ],
        font: [ "fontFamily", "fontSize", "fontStyle", "fontVariant", "fontWeight", "lineHeight" ],
        margin: [ "marginTop", "marginRight", "marginBottom", "marginLeft" ],
        outline: [ "outlineColor", "outlineStyle", "outlineWidth" ],
        padding: [ "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" ]
    };
    var shorthandExpanderElem = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    var borderWidthAliases = {
        thin: "1px",
        medium: "3px",
        thick: "5px"
    };
    var aliases = {
        borderBottomWidth: borderWidthAliases,
        borderLeftWidth: borderWidthAliases,
        borderRightWidth: borderWidthAliases,
        borderTopWidth: borderWidthAliases,
        fontSize: {
            "xx-small": "60%",
            "x-small": "75%",
            small: "89%",
            medium: "100%",
            large: "120%",
            "x-large": "150%",
            "xx-large": "200%"
        },
        fontWeight: {
            normal: "400",
            bold: "700"
        },
        outlineWidth: borderWidthAliases,
        textShadow: {
            none: "0px 0px 0px transparent"
        },
        boxShadow: {
            none: "0px 0px 0px 0px transparent"
        }
    };
    function antiAlias(property, value) {
        if (property in aliases) {
            return aliases[property][value] || value;
        }
        return value;
    }
    function isNotAnimatable(property) {
        return property === "display" || property.lastIndexOf("animation", 0) === 0 || property.lastIndexOf("transition", 0) === 0;
    }
    function expandShorthandAndAntiAlias(property, value, result) {
        if (isNotAnimatable(property)) {
            return;
        }
        var longProperties = shorthandToLonghand[property];
        if (longProperties) {
            shorthandExpanderElem.style[property] = value;
            for (var i in longProperties) {
                var longProperty = longProperties[i];
                var longhandValue = shorthandExpanderElem.style[longProperty];
                result[longProperty] = antiAlias(longProperty, longhandValue);
            }
        } else {
            result[property] = antiAlias(property, value);
        }
    }
    function convertToArrayForm(effectInput) {
        var normalizedEffectInput = [];
        for (var property in effectInput) {
            if (property in [ "easing", "offset", "composite" ]) {
                continue;
            }
            var values = effectInput[property];
            if (!Array.isArray(values)) {
                values = [ values ];
            }
            var keyframe;
            var numKeyframes = values.length;
            for (var i = 0; i < numKeyframes; i++) {
                keyframe = {};
                if ("offset" in effectInput) {
                    keyframe.offset = effectInput.offset;
                } else if (numKeyframes == 1) {
                    keyframe.offset = 1;
                } else {
                    keyframe.offset = i / (numKeyframes - 1);
                }
                if ("easing" in effectInput) {
                    keyframe.easing = effectInput.easing;
                }
                if ("composite" in effectInput) {
                    keyframe.composite = effectInput.composite;
                }
                keyframe[property] = values[i];
                normalizedEffectInput.push(keyframe);
            }
        }
        normalizedEffectInput.sort(function(a, b) {
            return a.offset - b.offset;
        });
        return normalizedEffectInput;
    }
    function normalizeKeyframes(effectInput) {
        if (effectInput == null) {
            return [];
        }
        if (window.Symbol && Symbol.iterator && Array.prototype.from && effectInput[Symbol.iterator]) {
            effectInput = Array.from(effectInput);
        }
        if (!Array.isArray(effectInput)) {
            effectInput = convertToArrayForm(effectInput);
        }
        var keyframes = effectInput.map(function(originalKeyframe) {
            var keyframe = {};
            for (var member in originalKeyframe) {
                var memberValue = originalKeyframe[member];
                if (member == "offset") {
                    if (memberValue != null) {
                        memberValue = Number(memberValue);
                        if (!isFinite(memberValue)) throw new TypeError("Keyframe offsets must be numbers.");
                        if (memberValue < 0 || memberValue > 1) throw new TypeError("Keyframe offsets must be between 0 and 1.");
                    }
                } else if (member == "composite") {
                    if (memberValue == "add" || memberValue == "accumulate") {
                        throw {
                            type: DOMException.NOT_SUPPORTED_ERR,
                            name: "NotSupportedError",
                            message: "add compositing is not supported"
                        };
                    } else if (memberValue != "replace") {
                        throw new TypeError("Invalid composite mode " + memberValue + ".");
                    }
                } else if (member == "easing") {
                    memberValue = shared.normalizeEasing(memberValue);
                } else {
                    memberValue = "" + memberValue;
                }
                expandShorthandAndAntiAlias(member, memberValue, keyframe);
            }
            if (keyframe.offset == undefined) keyframe.offset = null;
            if (keyframe.easing == undefined) keyframe.easing = "linear";
            return keyframe;
        });
        var everyFrameHasOffset = true;
        var looselySortedByOffset = true;
        var previousOffset = -Infinity;
        for (var i = 0; i < keyframes.length; i++) {
            var offset = keyframes[i].offset;
            if (offset != null) {
                if (offset < previousOffset) {
                    throw new TypeError("Keyframes are not loosely sorted by offset. Sort or specify offsets.");
                }
                previousOffset = offset;
            } else {
                everyFrameHasOffset = false;
            }
        }
        keyframes = keyframes.filter(function(keyframe) {
            return keyframe.offset >= 0 && keyframe.offset <= 1;
        });
        function spaceKeyframes() {
            var length = keyframes.length;
            if (keyframes[length - 1].offset == null) keyframes[length - 1].offset = 1;
            if (length > 1 && keyframes[0].offset == null) keyframes[0].offset = 0;
            var previousIndex = 0;
            var previousOffset = keyframes[0].offset;
            for (var i = 1; i < length; i++) {
                var offset = keyframes[i].offset;
                if (offset != null) {
                    for (var j = 1; j < i - previousIndex; j++) keyframes[previousIndex + j].offset = previousOffset + (offset - previousOffset) * j / (i - previousIndex);
                    previousIndex = i;
                    previousOffset = offset;
                }
            }
        }
        if (!everyFrameHasOffset) spaceKeyframes();
        return keyframes;
    }
    shared.convertToArrayForm = convertToArrayForm;
    shared.normalizeKeyframes = normalizeKeyframes;
    if (WEB_ANIMATIONS_TESTING) {
        testing.normalizeKeyframes = normalizeKeyframes;
    }
})(webAnimationsShared, webAnimationsTesting);

(function(shared) {
    var silenced = {};
    shared.isDeprecated = function(feature, date, advice, plural) {
        if (WEB_ANIMATIONS_TESTING) {
            return true;
        }
        var auxVerb = plural ? "are" : "is";
        var today = new Date();
        var expiry = new Date(date);
        expiry.setMonth(expiry.getMonth() + 3);
        if (today < expiry) {
            if (!(feature in silenced)) {
                console.warn("Web Animations: " + feature + " " + auxVerb + " deprecated and will stop working on " + expiry.toDateString() + ". " + advice);
            }
            silenced[feature] = true;
            return false;
        } else {
            return true;
        }
    };
    shared.deprecated = function(feature, date, advice, plural) {
        var auxVerb = plural ? "are" : "is";
        if (shared.isDeprecated(feature, date, advice, plural)) {
            throw new Error(feature + " " + auxVerb + " no longer supported. " + advice);
        }
    };
})(webAnimationsShared);

(function() {
    if (document.documentElement.animate) {
        var player = document.documentElement.animate([], 0);
        var load = true;
        if (player) {
            load = false;
            "play|currentTime|pause|reverse|playbackRate|cancel|finish|startTime|playState".split("|").forEach(function(t) {
                if (player[t] === undefined) {
                    load = true;
                }
            });
        }
        if (!load) {
            return;
        }
    }
    (function(shared, scope, testing) {
        scope.convertEffectInput = function(effectInput) {
            var keyframes = shared.normalizeKeyframes(effectInput);
            var propertySpecificKeyframeGroups = makePropertySpecificKeyframeGroups(keyframes);
            var interpolations = makeInterpolations(propertySpecificKeyframeGroups);
            return function(target, fraction) {
                if (fraction != null) {
                    interpolations.filter(function(interpolation) {
                        return fraction >= interpolation.applyFrom && fraction < interpolation.applyTo;
                    }).forEach(function(interpolation) {
                        var offsetFraction = fraction - interpolation.startOffset;
                        var localDuration = interpolation.endOffset - interpolation.startOffset;
                        var scaledLocalTime = localDuration == 0 ? 0 : interpolation.easingFunction(offsetFraction / localDuration);
                        scope.apply(target, interpolation.property, interpolation.interpolation(scaledLocalTime));
                    });
                } else {
                    for (var property in propertySpecificKeyframeGroups) if (property != "offset" && property != "easing" && property != "composite") scope.clear(target, property);
                }
            };
        };
        function makePropertySpecificKeyframeGroups(keyframes) {
            var propertySpecificKeyframeGroups = {};
            for (var i = 0; i < keyframes.length; i++) {
                for (var member in keyframes[i]) {
                    if (member != "offset" && member != "easing" && member != "composite") {
                        var propertySpecificKeyframe = {
                            offset: keyframes[i].offset,
                            easing: keyframes[i].easing,
                            value: keyframes[i][member]
                        };
                        propertySpecificKeyframeGroups[member] = propertySpecificKeyframeGroups[member] || [];
                        propertySpecificKeyframeGroups[member].push(propertySpecificKeyframe);
                    }
                }
            }
            for (var groupName in propertySpecificKeyframeGroups) {
                var group = propertySpecificKeyframeGroups[groupName];
                if (group[0].offset != 0 || group[group.length - 1].offset != 1) {
                    throw {
                        type: DOMException.NOT_SUPPORTED_ERR,
                        name: "NotSupportedError",
                        message: "Partial keyframes are not supported"
                    };
                }
            }
            return propertySpecificKeyframeGroups;
        }
        function makeInterpolations(propertySpecificKeyframeGroups) {
            var interpolations = [];
            for (var groupName in propertySpecificKeyframeGroups) {
                var keyframes = propertySpecificKeyframeGroups[groupName];
                for (var i = 0; i < keyframes.length - 1; i++) {
                    var startIndex = i;
                    var endIndex = i + 1;
                    var startOffset = keyframes[startIndex].offset;
                    var endOffset = keyframes[endIndex].offset;
                    var applyFrom = startOffset;
                    var applyTo = endOffset;
                    if (i == 0) {
                        applyFrom = -Infinity;
                        WEB_ANIMATIONS_TESTING && console.assert(startOffset == 0);
                        if (endOffset == 0) {
                            endIndex = startIndex;
                        }
                    }
                    if (i == keyframes.length - 2) {
                        applyTo = Infinity;
                        WEB_ANIMATIONS_TESTING && console.assert(endOffset == 1);
                        if (startOffset == 1) {
                            startIndex = endIndex;
                        }
                    }
                    interpolations.push({
                        applyFrom: applyFrom,
                        applyTo: applyTo,
                        startOffset: keyframes[startIndex].offset,
                        endOffset: keyframes[endIndex].offset,
                        easingFunction: shared.parseEasingFunction(keyframes[startIndex].easing),
                        property: groupName,
                        interpolation: scope.propertyInterpolation(groupName, keyframes[startIndex].value, keyframes[endIndex].value)
                    });
                }
            }
            interpolations.sort(function(leftInterpolation, rightInterpolation) {
                return leftInterpolation.startOffset - rightInterpolation.startOffset;
            });
            return interpolations;
        }
        if (WEB_ANIMATIONS_TESTING) {
            testing.makePropertySpecificKeyframeGroups = makePropertySpecificKeyframeGroups;
            testing.makeInterpolations = makeInterpolations;
        }
    })(webAnimationsShared, webAnimations1, webAnimationsTesting);
    (function(shared, scope, testing) {
        var propertyHandlers = {};
        function toCamelCase(property) {
            return property.replace(/-(.)/g, function(_, c) {
                return c.toUpperCase();
            });
        }
        function addPropertyHandler(parser, merger, property) {
            propertyHandlers[property] = propertyHandlers[property] || [];
            propertyHandlers[property].push([ parser, merger ]);
        }
        function addPropertiesHandler(parser, merger, properties) {
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                WEB_ANIMATIONS_TESTING && console.assert(property.toLowerCase() === property);
                addPropertyHandler(parser, merger, toCamelCase(property));
            }
        }
        scope.addPropertiesHandler = addPropertiesHandler;
        var initialValues = {
            backgroundColor: "transparent",
            backgroundPosition: "0% 0%",
            borderBottomColor: "currentColor",
            borderBottomLeftRadius: "0px",
            borderBottomRightRadius: "0px",
            borderBottomWidth: "3px",
            borderLeftColor: "currentColor",
            borderLeftWidth: "3px",
            borderRightColor: "currentColor",
            borderRightWidth: "3px",
            borderSpacing: "2px",
            borderTopColor: "currentColor",
            borderTopLeftRadius: "0px",
            borderTopRightRadius: "0px",
            borderTopWidth: "3px",
            bottom: "auto",
            clip: "rect(0px, 0px, 0px, 0px)",
            color: "black",
            fontSize: "100%",
            fontWeight: "400",
            height: "auto",
            left: "auto",
            letterSpacing: "normal",
            lineHeight: "120%",
            marginBottom: "0px",
            marginLeft: "0px",
            marginRight: "0px",
            marginTop: "0px",
            maxHeight: "none",
            maxWidth: "none",
            minHeight: "0px",
            minWidth: "0px",
            opacity: "1.0",
            outlineColor: "invert",
            outlineOffset: "0px",
            outlineWidth: "3px",
            paddingBottom: "0px",
            paddingLeft: "0px",
            paddingRight: "0px",
            paddingTop: "0px",
            right: "auto",
            strokeDasharray: "none",
            strokeDashoffset: "0px",
            textIndent: "0px",
            textShadow: "0px 0px 0px transparent",
            top: "auto",
            transform: "",
            verticalAlign: "0px",
            visibility: "visible",
            width: "auto",
            wordSpacing: "normal",
            zIndex: "auto"
        };
        function propertyInterpolation(property, left, right) {
            var ucProperty = property;
            if (/-/.test(property) && !shared.isDeprecated("Hyphenated property names", "2016-03-22", "Use camelCase instead.", true)) {
                ucProperty = toCamelCase(property);
            }
            if (left == "initial" || right == "initial") {
                if (left == "initial") left = initialValues[ucProperty];
                if (right == "initial") right = initialValues[ucProperty];
            }
            var handlers = left == right ? [] : propertyHandlers[ucProperty];
            for (var i = 0; handlers && i < handlers.length; i++) {
                var parsedLeft = handlers[i][0](left);
                var parsedRight = handlers[i][0](right);
                if (parsedLeft !== undefined && parsedRight !== undefined) {
                    var interpolationArgs = handlers[i][1](parsedLeft, parsedRight);
                    if (interpolationArgs) {
                        var interp = scope.Interpolation.apply(null, interpolationArgs);
                        return function(t) {
                            if (t == 0) return left;
                            if (t == 1) return right;
                            return interp(t);
                        };
                    }
                }
            }
            return scope.Interpolation(false, true, function(bool) {
                return bool ? right : left;
            });
        }
        scope.propertyInterpolation = propertyInterpolation;
    })(webAnimationsShared, webAnimations1, webAnimationsTesting);
    (function(shared, scope, testing) {
        function EffectTime(timing) {
            var timeFraction = 0;
            var activeDuration = shared.calculateActiveDuration(timing);
            var effectTime = function(localTime) {
                return shared.calculateIterationProgress(activeDuration, localTime, timing);
            };
            effectTime._totalDuration = timing.delay + activeDuration + timing.endDelay;
            return effectTime;
        }
        scope.KeyframeEffect = function(target, effectInput, timingInput, id) {
            var effectTime = EffectTime(shared.normalizeTimingInput(timingInput));
            var interpolations = scope.convertEffectInput(effectInput);
            var timeFraction;
            var keyframeEffect = function() {
                WEB_ANIMATIONS_TESTING && console.assert(typeof timeFraction !== "undefined");
                interpolations(target, timeFraction);
            };
            keyframeEffect._update = function(localTime) {
                timeFraction = effectTime(localTime);
                return timeFraction !== null;
            };
            keyframeEffect._clear = function() {
                interpolations(target, null);
            };
            keyframeEffect._hasSameTarget = function(otherTarget) {
                return target === otherTarget;
            };
            keyframeEffect._target = target;
            keyframeEffect._totalDuration = effectTime._totalDuration;
            keyframeEffect._id = id;
            return keyframeEffect;
        };
        if (WEB_ANIMATIONS_TESTING) {
            testing.webAnimations1KeyframeEffect = scope.KeyframeEffect;
            testing.effectTime = EffectTime;
        }
    })(webAnimationsShared, webAnimations1, webAnimationsTesting);
    (function(scope, testing) {
        var SVG_TRANSFORM_PROP = "_webAnimationsUpdateSvgTransformAttr";
        function updateSvgTransformAttr(window, element) {
            if (!element.namespaceURI || element.namespaceURI.indexOf("/svg") == -1) {
                return false;
            }
            if (!(SVG_TRANSFORM_PROP in window)) {
                window[SVG_TRANSFORM_PROP] = /Trident|MSIE|IEMobile|Edge|Android 4/i.test(window.navigator.userAgent);
            }
            return window[SVG_TRANSFORM_PROP];
        }
        var styleAttributes = {
            cssText: 1,
            length: 1,
            parentRule: 1
        };
        var styleMethods = {
            getPropertyCSSValue: 1,
            getPropertyPriority: 1,
            getPropertyValue: 1,
            item: 1,
            removeProperty: 1,
            setProperty: 1
        };
        var styleMutatingMethods = {
            removeProperty: 1,
            setProperty: 1
        };
        function configureProperty(object, property, descriptor) {
            descriptor.enumerable = true;
            descriptor.configurable = true;
            Object.defineProperty(object, property, descriptor);
        }
        function AnimatedCSSStyleDeclaration(element) {
            WEB_ANIMATIONS_TESTING && console.assert(!(element.style instanceof AnimatedCSSStyleDeclaration), "Element must not already have an animated style attached.");
            this._element = element;
            this._surrogateStyle = document.createElementNS("http://www.w3.org/1999/xhtml", "div").style;
            this._style = element.style;
            this._isAnimatedProperty = {};
            this._updateSvgTransformAttr = updateSvgTransformAttr(window, element);
            this._savedTransformAttr = null;

            for (var i = 0; i < this._style.length; i++) {
                var property = this._style[i];
                this._surrogateStyle.setProperty(property, this._style.getPropertyValue(property));
            }

            this._length = 0;
            this._updateIndices();
        }
        AnimatedCSSStyleDeclaration.prototype = {
            get cssText() {
                return this._surrogateStyle.cssText;
            },
            set cssText(text) {
                var isAffectedProperty = {};
                for (var i = 0; i < this._surrogateStyle.length; i++) {
                    isAffectedProperty[this._surrogateStyle[i]] = true;
                }
                this._surrogateStyle.cssText = text;
                this._updateIndices();
                for (var i = 0; i < this._surrogateStyle.length; i++) {
                    isAffectedProperty[this._surrogateStyle[i]] = true;
                }
                for (var property in isAffectedProperty) {
                    if (!this._isAnimatedProperty[property]) {
                        this._style.setProperty(property, this._surrogateStyle.getPropertyValue(property));
                    }
                }
            },
            get length() {
                return this._surrogateStyle.length;
            },
            get parentRule() {
                return this._style.parentRule;
            },
            _updateIndices: function() {
                while (this._length < this._surrogateStyle.length) {
                    Object.defineProperty(this, this._length, {
                        configurable: true,
                        enumerable: false,
                        get: function(index) {
                            return function() {
                                return this._surrogateStyle[index];
                            };
                        }(this._length)
                    });
                    this._length++;
                }
                while (this._length > this._surrogateStyle.length) {
                    this._length--;
                    Object.defineProperty(this, this._length, {
                        configurable: true,
                        enumerable: false,
                        value: undefined
                    });
                }
            },
            _set: function(property, value) {
                this._style.setProperty(property, value);
                this._isAnimatedProperty[property] = true;
                if (this._updateSvgTransformAttr && scope.unprefixedPropertyName(property) == "transform") {
                    if (this._savedTransformAttr == null) {
                        this._savedTransformAttr = this._element.getAttribute("transform");
                    }
                    this._element.setAttribute("transform", scope.transformToSvgMatrix(value));
                }
            },
            _clear: function(property) {
                this._style.setProperty(property, this._surrogateStyle.getPropertyValue(property));
                if (this._updateSvgTransformAttr && scope.unprefixedPropertyName(property) == "transform") {
                    if (this._savedTransformAttr) {
                        this._element.setAttribute("transform", this._savedTransformAttr);
                    } else {
                        this._element.removeAttribute("transform");
                    }
                    this._savedTransformAttr = null;
                }
                delete this._isAnimatedProperty[property];
            }
        };
        for (var method in styleMethods) {
            AnimatedCSSStyleDeclaration.prototype[method] = function(method, modifiesStyle) {
                return function() {
                    var result = this._surrogateStyle[method].apply(this._surrogateStyle, arguments);
                    if (modifiesStyle) {
                        if (!this._isAnimatedProperty[arguments[0]]) {
                          this._style[method].apply(this._style, arguments);
                        }
                        this._updateIndices();
                    }
                    return result;
                };
            }(method, method in styleMutatingMethods);
        }
        for (var property in document.documentElement.style) {
            if (property in styleAttributes || property in styleMethods) {
                continue;
            }
            (function(property) {
                configureProperty(AnimatedCSSStyleDeclaration.prototype, property, {
                    get: function() {
                        return this._surrogateStyle[property];
                    },
                    set: function(value) {
                        this._surrogateStyle.setProperty(property, value);
                        this._updateIndices();
                        if (!this._isAnimatedProperty[property]) this._style.setProperty(property, value);
                    }
                });
            })(property);
        }
        function ensureStyleIsPatched(element) {
            if (element._webAnimationsPatchedStyle) return;
            try {
                if (isNodeJS()) {
                  throw new Error('getComputedStyle fails with AnimatedCSSStyleDeclaration');
                }

                var animatedStyle = new AnimatedCSSStyleDeclaration(element);

                configureProperty(element, "style", {
                    get: function() {
                        return animatedStyle;
                    }
                });
            } catch (_) {
                element.style._set = function(property, value) {
                    element.style.setProperty(property, value);
                };
                element.style._clear = function(property) {
                    element.style.setProperty(property, "");
                };
            }
            element._webAnimationsPatchedStyle = element.style;
        }
        scope.apply = function(element, property, value) {
            ensureStyleIsPatched(element);
            element.style._set(scope.propertyName(property), value);
        };
        scope.clear = function(element, property) {
            if (element._webAnimationsPatchedStyle) {
                element.style._clear(scope.propertyName(property));
            }
        };
        if (WEB_ANIMATIONS_TESTING) {
            testing.ensureStyleIsPatched = ensureStyleIsPatched;
            testing.updateSvgTransformAttr = updateSvgTransformAttr;
        }
    })(webAnimations1, webAnimationsTesting);
    (function(scope) {
        window.Element.prototype.animate = function(effectInput, options) {
            var id = "";
            if (options && options.id) {
                id = options.id;
            }
            return scope.timeline._play(scope.KeyframeEffect(this, effectInput, options, id));
        };
    })(webAnimations1);
    (function(scope, testing) {
        function interpolate(from, to, f) {
            if (typeof from == "number" && typeof to == "number") {
                return from * (1 - f) + to * f;
            }
            if (typeof from == "boolean" && typeof to == "boolean") {
                return f < .5 ? from : to;
            }
            WEB_ANIMATIONS_TESTING && console.assert(Array.isArray(from) && Array.isArray(to), "If interpolation arguments are not numbers or bools they must be arrays");
            if (from.length == to.length) {
                var r = [];
                for (var i = 0; i < from.length; i++) {
                    r.push(interpolate(from[i], to[i], f));
                }
                return r;
            }
            throw "Mismatched interpolation arguments " + from + ":" + to;
        }
        scope.Interpolation = function(from, to, convertToString) {
            return function(f) {
                return convertToString(interpolate(from, to, f));
            };
        };
        if (WEB_ANIMATIONS_TESTING) {
            testing.interpolate = interpolate;
        }
    })(webAnimations1, webAnimationsTesting);
    (function(scope, testing) {
        var composeMatrix = function() {
            function multiply(a, b) {
                var result = [ [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ] ];
                for (var i = 0; i < 4; i++) {
                    for (var j = 0; j < 4; j++) {
                        for (var k = 0; k < 4; k++) {
                            result[i][j] += b[i][k] * a[k][j];
                        }
                    }
                }
                return result;
            }
            function is2D(m) {
                return m[0][2] == 0 && m[0][3] == 0 && m[1][2] == 0 && m[1][3] == 0 && m[2][0] == 0 && m[2][1] == 0 && m[2][2] == 1 && m[2][3] == 0 && m[3][2] == 0 && m[3][3] == 1;
            }
            function composeMatrix(translate, scale, skew, quat, perspective) {
                var matrix = [ [ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, 1, 0 ], [ 0, 0, 0, 1 ] ];
                for (var i = 0; i < 4; i++) {
                    matrix[i][3] = perspective[i];
                }
                for (var i = 0; i < 3; i++) {
                    for (var j = 0; j < 3; j++) {
                        matrix[3][i] += translate[j] * matrix[j][i];
                    }
                }
                var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
                var rotMatrix = [ [ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, 1, 0 ], [ 0, 0, 0, 1 ] ];
                rotMatrix[0][0] = 1 - 2 * (y * y + z * z);
                rotMatrix[0][1] = 2 * (x * y - z * w);
                rotMatrix[0][2] = 2 * (x * z + y * w);
                rotMatrix[1][0] = 2 * (x * y + z * w);
                rotMatrix[1][1] = 1 - 2 * (x * x + z * z);
                rotMatrix[1][2] = 2 * (y * z - x * w);
                rotMatrix[2][0] = 2 * (x * z - y * w);
                rotMatrix[2][1] = 2 * (y * z + x * w);
                rotMatrix[2][2] = 1 - 2 * (x * x + y * y);
                matrix = multiply(matrix, rotMatrix);
                var temp = [ [ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, 1, 0 ], [ 0, 0, 0, 1 ] ];
                if (skew[2]) {
                    temp[2][1] = skew[2];
                    matrix = multiply(matrix, temp);
                }
                if (skew[1]) {
                    temp[2][1] = 0;
                    temp[2][0] = skew[0];
                    matrix = multiply(matrix, temp);
                }
                if (skew[0]) {
                    temp[2][0] = 0;
                    temp[1][0] = skew[0];
                    matrix = multiply(matrix, temp);
                }
                for (var i = 0; i < 3; i++) {
                    for (var j = 0; j < 3; j++) {
                        matrix[i][j] *= scale[i];
                    }
                }
                if (is2D(matrix)) {
                    return [ matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1], matrix[3][0], matrix[3][1] ];
                }
                return matrix[0].concat(matrix[1], matrix[2], matrix[3]);
            }
            return composeMatrix;
        }();
        function clamp(x, min, max) {
            return Math.max(Math.min(x, max), min);
        }
        function quat(fromQ, toQ, f) {
            var product = scope.dot(fromQ, toQ);
            product = clamp(product, -1, 1);
            var quat = [];
            if (product === 1) {
                quat = fromQ;
            } else {
                var theta = Math.acos(product);
                var w = Math.sin(f * theta) * 1 / Math.sqrt(1 - product * product);
                for (var i = 0; i < 4; i++) {
                    quat.push(fromQ[i] * (Math.cos(f * theta) - product * w) + toQ[i] * w);
                }
            }
            return quat;
        }
        scope.composeMatrix = composeMatrix;
        scope.quat = quat;
    })(webAnimations1, webAnimationsTesting);
    (function(shared, scope, testing) {
        shared.sequenceNumber = 0;
        var AnimationEvent = function(target, currentTime, timelineTime) {
            this.target = target;
            this.currentTime = currentTime;
            this.timelineTime = timelineTime;
            this.type = "finish";
            this.bubbles = false;
            this.cancelable = false;
            this.currentTarget = target;
            this.defaultPrevented = false;
            this.eventPhase = Event.AT_TARGET;
            this.timeStamp = Date.now();
        };
        scope.Animation = function(effect) {
            this.id = "";
            if (effect && effect._id) {
                this.id = effect._id;
            }
            this._sequenceNumber = shared.sequenceNumber++;
            this._currentTime = 0;
            this._startTime = null;
            this._paused = false;
            this._playbackRate = 1;
            this._inTimeline = true;
            this._finishedFlag = true;
            this.onfinish = null;
            this._finishHandlers = [];
            this._effect = effect;
            this._inEffect = this._effect._update(0);
            this._idle = true;
            this._currentTimePending = false;
        };
        scope.Animation.prototype = {
            _ensureAlive: function() {
                if (this.playbackRate < 0 && this.currentTime === 0) {
                    this._inEffect = this._effect._update(-1);
                } else {
                    this._inEffect = this._effect._update(this.currentTime);
                }
                if (!this._inTimeline && (this._inEffect || !this._finishedFlag)) {
                    this._inTimeline = true;
                    scope.timeline._animations.push(this);
                }
            },
            _tickCurrentTime: function(newTime, ignoreLimit) {
                if (newTime != this._currentTime) {
                    this._currentTime = newTime;
                    if (this._isFinished && !ignoreLimit) this._currentTime = this._playbackRate > 0 ? this._totalDuration : 0;
                    this._ensureAlive();
                }
            },
            get currentTime() {
                if (this._idle || this._currentTimePending) return null;
                return this._currentTime;
            },
            set currentTime(newTime) {
                newTime = +newTime;
                if (isNaN(newTime)) return;
                scope.restart();
                if (!this._paused && this._startTime != null) {
                    this._startTime = this._timeline.currentTime - newTime / this._playbackRate;
                }
                this._currentTimePending = false;
                if (this._currentTime == newTime) return;
                if (this._idle) {
                    this._idle = false;
                    this._paused = true;
                }
                this._tickCurrentTime(newTime, true);
                scope.applyDirtiedAnimation(this);
            },
            get startTime() {
                return this._startTime;
            },
            set startTime(newTime) {
                newTime = +newTime;
                if (isNaN(newTime)) return;
                if (this._paused || this._idle) return;
                this._startTime = newTime;
                this._tickCurrentTime((this._timeline.currentTime - this._startTime) * this.playbackRate);
                scope.applyDirtiedAnimation(this);
            },
            get playbackRate() {
                return this._playbackRate;
            },
            set playbackRate(value) {
                if (value == this._playbackRate) {
                    return;
                }
                var oldCurrentTime = this.currentTime;
                this._playbackRate = value;
                this._startTime = null;
                if (this.playState != "paused" && this.playState != "idle") {
                    this._finishedFlag = false;
                    this._idle = false;
                    this._ensureAlive();
                    scope.applyDirtiedAnimation(this);
                }
                if (oldCurrentTime != null) {
                    this.currentTime = oldCurrentTime;
                }
            },
            get _isFinished() {
                return !this._idle && (this._playbackRate > 0 && this._currentTime >= this._totalDuration || this._playbackRate < 0 && this._currentTime <= 0);
            },
            get _totalDuration() {
                return this._effect._totalDuration;
            },
            get playState() {
                if (this._idle) return "idle";
                if (this._startTime == null && !this._paused && this.playbackRate != 0 || this._currentTimePending) return "pending";
                if (this._paused) return "paused";
                if (this._isFinished) return "finished";
                return "running";
            },
            _rewind: function() {
                if (this._playbackRate >= 0) {
                    this._currentTime = 0;
                } else if (this._totalDuration < Infinity) {
                    this._currentTime = this._totalDuration;
                } else {
                    throw new DOMException("Unable to rewind negative playback rate animation with infinite duration", "InvalidStateError");
                }
            },
            play: function() {
                this._paused = false;
                if (this._isFinished || this._idle) {
                    this._rewind();
                    this._startTime = null;
                }
                this._finishedFlag = false;
                this._idle = false;
                this._ensureAlive();
                scope.applyDirtiedAnimation(this);
            },
            pause: function() {
                if (!this._isFinished && !this._paused && !this._idle) {
                    this._currentTimePending = true;
                } else if (this._idle) {
                    this._rewind();
                    this._idle = false;
                }
                this._startTime = null;
                this._paused = true;
            },
            finish: function() {
                if (this._idle) return;
                this.currentTime = this._playbackRate > 0 ? this._totalDuration : 0;
                this._startTime = this._totalDuration - this.currentTime;
                this._currentTimePending = false;
                scope.applyDirtiedAnimation(this);
            },
            cancel: function() {
                if (!this._inEffect) return;
                this._inEffect = false;
                this._idle = true;
                this._paused = false;
                this._finishedFlag = true;
                this._currentTime = 0;
                this._startTime = null;
                this._effect._update(null);
                scope.applyDirtiedAnimation(this);
            },
            reverse: function() {
                this.playbackRate *= -1;
                this.play();
            },
            addEventListener: function(type, handler) {
                if (typeof handler == "function" && type == "finish") this._finishHandlers.push(handler);
            },
            removeEventListener: function(type, handler) {
                if (type != "finish") return;
                var index = this._finishHandlers.indexOf(handler);
                if (index >= 0) this._finishHandlers.splice(index, 1);
            },
            _fireEvents: function(baseTime) {
                if (this._isFinished) {
                    if (!this._finishedFlag) {
                        var event = new AnimationEvent(this, this._currentTime, baseTime);
                        var handlers = this._finishHandlers.concat(this.onfinish ? [ this.onfinish ] : []);
                        setTimeout(function() {
                            handlers.forEach(function(handler) {
                                handler.call(event.target, event);
                            });
                        }, 0);
                        this._finishedFlag = true;
                    }
                } else {
                    this._finishedFlag = false;
                }
            },
            _tick: function(timelineTime, isAnimationFrame) {
                if (!this._idle && !this._paused) {
                    if (this._startTime == null) {
                        if (isAnimationFrame) {
                            this.startTime = timelineTime - this._currentTime / this.playbackRate;
                        }
                    } else if (!this._isFinished) {
                        this._tickCurrentTime((timelineTime - this._startTime) * this.playbackRate);
                    }
                }
                if (isAnimationFrame) {
                    this._currentTimePending = false;
                    this._fireEvents(timelineTime);
                }
            },
            get _needsTick() {
                return this.playState in {
                    pending: 1,
                    running: 1
                } || !this._finishedFlag;
            },
            _targetAnimations: function() {
                var target = this._effect._target;
                if (!target._activeAnimations) {
                    target._activeAnimations = [];
                }
                return target._activeAnimations;
            },
            _markTarget: function() {
                var animations = this._targetAnimations();
                if (animations.indexOf(this) === -1) {
                    animations.push(this);
                }
            },
            _unmarkTarget: function() {
                var animations = this._targetAnimations();
                var index = animations.indexOf(this);
                if (index !== -1) {
                    animations.splice(index, 1);
                }
            }
        };
        if (WEB_ANIMATIONS_TESTING) {
            testing.webAnimations1Animation = scope.Animation;
        }
    })(webAnimationsShared, webAnimations1, webAnimationsTesting);
    (function(shared, scope, testing) {
        var originalRequestAnimationFrame = window.requestAnimationFrame;
        var rafCallbacks = [];
        var rafId = 0;
        window.requestAnimationFrame = function(f) {
            var id = rafId++;
            if (rafCallbacks.length == 0 && !WEB_ANIMATIONS_TESTING) {
                originalRequestAnimationFrame(processRafCallbacks);
            }
            rafCallbacks.push([ id, f ]);
            return id;
        };
        window.cancelAnimationFrame = function(id) {
            rafCallbacks.forEach(function(entry) {
                if (entry[0] == id) {
                    entry[1] = function() {};
                }
            });
        };
        function processRafCallbacks(t) {
            var processing = rafCallbacks;
            rafCallbacks = [];
            if (t < timeline.currentTime) t = timeline.currentTime;
            timeline._animations.sort(compareAnimations);
            timeline._animations = tick(t, true, timeline._animations)[0];
            processing.forEach(function(entry) {
                entry[1](t);
            });
            applyPendingEffects();
            _now = undefined;
        }
        function compareAnimations(leftAnimation, rightAnimation) {
            return leftAnimation._sequenceNumber - rightAnimation._sequenceNumber;
        }
        function InternalTimeline() {
            this._animations = [];
            this.currentTime = window.performance && performance.now ? performance.now() : 0;
        }
        InternalTimeline.prototype = {
            _play: function(effect) {
                effect._timing = shared.normalizeTimingInput(effect.timing);
                var animation = new scope.Animation(effect);
                animation._idle = false;
                animation._timeline = this;
                this._animations.push(animation);
                scope.restart();
                scope.applyDirtiedAnimation(animation);
                return animation;
            }
        };
        var _now = undefined;
        if (WEB_ANIMATIONS_TESTING) {
            var now = function() {
                return timeline.currentTime;
            };
        } else {
            var now = function() {
                if (_now == undefined) _now = window.performance && performance.now ? performance.now() : Date.now();
                return _now;
            };
        }
        var ticking = false;
        var hasRestartedThisFrame = false;
        scope.restart = function() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(function() {});
                hasRestartedThisFrame = true;
            }
            return hasRestartedThisFrame;
        };
        scope.applyDirtiedAnimation = function(animation) {
            if (inTick) {
                return;
            }
            animation._markTarget();
            var animations = animation._targetAnimations();
            animations.sort(compareAnimations);
            var inactiveAnimations = tick(scope.timeline.currentTime, false, animations.slice())[1];
            inactiveAnimations.forEach(function(animation) {
                var index = timeline._animations.indexOf(animation);
                if (index !== -1) {
                    timeline._animations.splice(index, 1);
                }
            });
            applyPendingEffects();
        };
        var pendingEffects = [];
        function applyPendingEffects() {
            pendingEffects.forEach(function(f) {
                f();
            });
            pendingEffects.length = 0;
        }
        var t60hz = 1e3 / 60;
        var inTick = false;
        function tick(t, isAnimationFrame, updatingAnimations) {
            inTick = true;
            hasRestartedThisFrame = false;
            var timeline = scope.timeline;
            timeline.currentTime = t;
            ticking = false;
            var newPendingClears = [];
            var newPendingEffects = [];
            var activeAnimations = [];
            var inactiveAnimations = [];
            updatingAnimations.forEach(function(animation) {
                animation._tick(t, isAnimationFrame);
                if (!animation._inEffect) {
                    newPendingClears.push(animation._effect);
                    animation._unmarkTarget();
                } else {
                    newPendingEffects.push(animation._effect);
                    animation._markTarget();
                }
                if (animation._needsTick) ticking = true;
                var alive = animation._inEffect || animation._needsTick;
                animation._inTimeline = alive;
                if (alive) {
                    activeAnimations.push(animation);
                } else {
                    inactiveAnimations.push(animation);
                }
            });
            pendingEffects.push.apply(pendingEffects, newPendingClears);
            pendingEffects.push.apply(pendingEffects, newPendingEffects);
            if (ticking) window.requestAnimationFrame(function() {});
            inTick = false;
            return [ activeAnimations, inactiveAnimations ];
        }
        if (WEB_ANIMATIONS_TESTING) {
            testing.tick = function(t) {
                timeline.currentTime = t;
                processRafCallbacks(t);
            };
            testing.isTicking = function() {
                return ticking;
            };
            testing.setTicking = function(newVal) {
                ticking = newVal;
            };
        }
        var timeline = new InternalTimeline();
        scope.timeline = timeline;
    })(webAnimationsShared, webAnimations1, webAnimationsTesting);
    (function(scope, testing) {
        var decomposeMatrix = function() {
            function determinant(m) {
                return m[0][0] * m[1][1] * m[2][2] + m[1][0] * m[2][1] * m[0][2] + m[2][0] * m[0][1] * m[1][2] - m[0][2] * m[1][1] * m[2][0] - m[1][2] * m[2][1] * m[0][0] - m[2][2] * m[0][1] * m[1][0];
            }
            function inverse(m) {
                var iDet = 1 / determinant(m);
                var a = m[0][0], b = m[0][1], c = m[0][2];
                var d = m[1][0], e = m[1][1], f = m[1][2];
                var g = m[2][0], h = m[2][1], k = m[2][2];
                var Ainv = [ [ (e * k - f * h) * iDet, (c * h - b * k) * iDet, (b * f - c * e) * iDet, 0 ], [ (f * g - d * k) * iDet, (a * k - c * g) * iDet, (c * d - a * f) * iDet, 0 ], [ (d * h - e * g) * iDet, (g * b - a * h) * iDet, (a * e - b * d) * iDet, 0 ] ];
                var lastRow = [];
                for (var i = 0; i < 3; i++) {
                    var val = 0;
                    for (var j = 0; j < 3; j++) {
                        val += m[3][j] * Ainv[j][i];
                    }
                    lastRow.push(val);
                }
                lastRow.push(1);
                Ainv.push(lastRow);
                return Ainv;
            }
            function transposeMatrix4(m) {
                return [ [ m[0][0], m[1][0], m[2][0], m[3][0] ], [ m[0][1], m[1][1], m[2][1], m[3][1] ], [ m[0][2], m[1][2], m[2][2], m[3][2] ], [ m[0][3], m[1][3], m[2][3], m[3][3] ] ];
            }
            function multVecMatrix(v, m) {
                var result = [];
                for (var i = 0; i < 4; i++) {
                    var val = 0;
                    for (var j = 0; j < 4; j++) {
                        val += v[j] * m[j][i];
                    }
                    result.push(val);
                }
                return result;
            }
            function normalize(v) {
                var len = length(v);
                return [ v[0] / len, v[1] / len, v[2] / len ];
            }
            function length(v) {
                return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            }
            function combine(v1, v2, v1s, v2s) {
                return [ v1s * v1[0] + v2s * v2[0], v1s * v1[1] + v2s * v2[1], v1s * v1[2] + v2s * v2[2] ];
            }
            function cross(v1, v2) {
                return [ v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0] ];
            }
            function decomposeMatrix(matrix) {
                var m3d = [ matrix.slice(0, 4), matrix.slice(4, 8), matrix.slice(8, 12), matrix.slice(12, 16) ];
                if (m3d[3][3] !== 1) {
                    return null;
                }
                var perspectiveMatrix = [];
                for (var i = 0; i < 4; i++) {
                    perspectiveMatrix.push(m3d[i].slice());
                }
                for (var i = 0; i < 3; i++) {
                    perspectiveMatrix[i][3] = 0;
                }
                if (determinant(perspectiveMatrix) === 0) {
                    return null;
                }
                var rhs = [];
                var perspective;
                if (m3d[0][3] || m3d[1][3] || m3d[2][3]) {
                    rhs.push(m3d[0][3]);
                    rhs.push(m3d[1][3]);
                    rhs.push(m3d[2][3]);
                    rhs.push(m3d[3][3]);
                    var inversePerspectiveMatrix = inverse(perspectiveMatrix);
                    var transposedInversePerspectiveMatrix = transposeMatrix4(inversePerspectiveMatrix);
                    perspective = multVecMatrix(rhs, transposedInversePerspectiveMatrix);
                } else {
                    perspective = [ 0, 0, 0, 1 ];
                }
                var translate = m3d[3].slice(0, 3);
                var row = [];
                row.push(m3d[0].slice(0, 3));
                var scale = [];
                scale.push(length(row[0]));
                row[0] = normalize(row[0]);
                var skew = [];
                row.push(m3d[1].slice(0, 3));
                skew.push(dot(row[0], row[1]));
                row[1] = combine(row[1], row[0], 1, -skew[0]);
                scale.push(length(row[1]));
                row[1] = normalize(row[1]);
                skew[0] /= scale[1];
                row.push(m3d[2].slice(0, 3));
                skew.push(dot(row[0], row[2]));
                row[2] = combine(row[2], row[0], 1, -skew[1]);
                skew.push(dot(row[1], row[2]));
                row[2] = combine(row[2], row[1], 1, -skew[2]);
                scale.push(length(row[2]));
                row[2] = normalize(row[2]);
                skew[1] /= scale[2];
                skew[2] /= scale[2];
                var pdum3 = cross(row[1], row[2]);
                if (dot(row[0], pdum3) < 0) {
                    for (var i = 0; i < 3; i++) {
                        scale[i] *= -1;
                        row[i][0] *= -1;
                        row[i][1] *= -1;
                        row[i][2] *= -1;
                    }
                }
                var t = row[0][0] + row[1][1] + row[2][2] + 1;
                var s;
                var quaternion;
                if (t > 1e-4) {
                    s = .5 / Math.sqrt(t);
                    quaternion = [ (row[2][1] - row[1][2]) * s, (row[0][2] - row[2][0]) * s, (row[1][0] - row[0][1]) * s, .25 / s ];
                } else if (row[0][0] > row[1][1] && row[0][0] > row[2][2]) {
                    s = Math.sqrt(1 + row[0][0] - row[1][1] - row[2][2]) * 2;
                    quaternion = [ .25 * s, (row[0][1] + row[1][0]) / s, (row[0][2] + row[2][0]) / s, (row[2][1] - row[1][2]) / s ];
                } else if (row[1][1] > row[2][2]) {
                    s = Math.sqrt(1 + row[1][1] - row[0][0] - row[2][2]) * 2;
                    quaternion = [ (row[0][1] + row[1][0]) / s, .25 * s, (row[1][2] + row[2][1]) / s, (row[0][2] - row[2][0]) / s ];
                } else {
                    s = Math.sqrt(1 + row[2][2] - row[0][0] - row[1][1]) * 2;
                    quaternion = [ (row[0][2] + row[2][0]) / s, (row[1][2] + row[2][1]) / s, .25 * s, (row[1][0] - row[0][1]) / s ];
                }
                return [ translate, scale, skew, quaternion, perspective ];
            }
            return decomposeMatrix;
        }();
        function dot(v1, v2) {
            var result = 0;
            for (var i = 0; i < v1.length; i++) {
                result += v1[i] * v2[i];
            }
            return result;
        }
        function multiplyMatrices(a, b) {
            return [ a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3], a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3], a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3], a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3], a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7], a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7], a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7], a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7], a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11], a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11], a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11], a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11], a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15], a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15], a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15], a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15] ];
        }
        function toRadians(arg) {
            var rads = arg.rad || 0;
            var degs = arg.deg || 0;
            var grads = arg.grad || 0;
            var turns = arg.turn || 0;
            var angle = (degs / 360 + grads / 400 + turns) * (2 * Math.PI) + rads;
            return angle;
        }
        function convertItemToMatrix(item) {
            switch (item.t) {
              case "rotatex":
                var angle = toRadians(item.d[0]);
                return [ 1, 0, 0, 0, 0, Math.cos(angle), Math.sin(angle), 0, 0, -Math.sin(angle), Math.cos(angle), 0, 0, 0, 0, 1 ];

              case "rotatey":
                var angle = toRadians(item.d[0]);
                return [ Math.cos(angle), 0, -Math.sin(angle), 0, 0, 1, 0, 0, Math.sin(angle), 0, Math.cos(angle), 0, 0, 0, 0, 1 ];

              case "rotate":
              case "rotatez":
                var angle = toRadians(item.d[0]);
                return [ Math.cos(angle), Math.sin(angle), 0, 0, -Math.sin(angle), Math.cos(angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

              case "rotate3d":
                var x = item.d[0];
                var y = item.d[1];
                var z = item.d[2];
                var angle = toRadians(item.d[3]);
                var sqrLength = x * x + y * y + z * z;
                if (sqrLength === 0) {
                    x = 1;
                    y = 0;
                    z = 0;
                } else if (sqrLength !== 1) {
                    var length = Math.sqrt(sqrLength);
                    x /= length;
                    y /= length;
                    z /= length;
                }
                var s = Math.sin(angle / 2);
                var sc = s * Math.cos(angle / 2);
                var sq = s * s;
                return [ 1 - 2 * (y * y + z * z) * sq, 2 * (x * y * sq + z * sc), 2 * (x * z * sq - y * sc), 0, 2 * (x * y * sq - z * sc), 1 - 2 * (x * x + z * z) * sq, 2 * (y * z * sq + x * sc), 0, 2 * (x * z * sq + y * sc), 2 * (y * z * sq - x * sc), 1 - 2 * (x * x + y * y) * sq, 0, 0, 0, 0, 1 ];

              case "scale":
                return [ item.d[0], 0, 0, 0, 0, item.d[1], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

              case "scalex":
                return [ item.d[0], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

              case "scaley":
                return [ 1, 0, 0, 0, 0, item.d[0], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

              case "scalez":
                return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, item.d[0], 0, 0, 0, 0, 1 ];

              case "scale3d":
                return [ item.d[0], 0, 0, 0, 0, item.d[1], 0, 0, 0, 0, item.d[2], 0, 0, 0, 0, 1 ];

              case "skew":
                var xAngle = toRadians(item.d[0]);
                var yAngle = toRadians(item.d[1]);
                return [ 1, Math.tan(yAngle), 0, 0, Math.tan(xAngle), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

              case "skewx":
                var angle = toRadians(item.d[0]);
                return [ 1, 0, 0, 0, Math.tan(angle), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

              case "skewy":
                var angle = toRadians(item.d[0]);
                return [ 1, Math.tan(angle), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

              case "translate":
                var x = item.d[0].px || 0;
                var y = item.d[1].px || 0;
                return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, 0, 1 ];

              case "translatex":
                var x = item.d[0].px || 0;
                return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1 ];

              case "translatey":
                var y = item.d[0].px || 0;
                return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, y, 0, 1 ];

              case "translatez":
                var z = item.d[0].px || 0;
                return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z, 1 ];

              case "translate3d":
                var x = item.d[0].px || 0;
                var y = item.d[1].px || 0;
                var z = item.d[2].px || 0;
                return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1 ];

              case "perspective":
                var p = item.d[0].px ? -1 / item.d[0].px : 0;
                return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, p, 0, 0, 0, 1 ];

              case "matrix":
                return [ item.d[0], item.d[1], 0, 0, item.d[2], item.d[3], 0, 0, 0, 0, 1, 0, item.d[4], item.d[5], 0, 1 ];

              case "matrix3d":
                return item.d;

              default:
                WEB_ANIMATIONS_TESTING && console.assert(false, "Transform item type " + item.t + " conversion to matrix not yet implemented.");
            }
        }
        function convertToMatrix(transformList) {
            if (transformList.length === 0) {
                return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
            }
            return transformList.map(convertItemToMatrix).reduce(multiplyMatrices);
        }
        function makeMatrixDecomposition(transformList) {
            return [ decomposeMatrix(convertToMatrix(transformList)) ];
        }
        scope.dot = dot;
        scope.makeMatrixDecomposition = makeMatrixDecomposition;
        scope.transformListToMatrix = convertToMatrix;
    })(webAnimations1, webAnimationsTesting);
    (function(scope) {
        function consumeToken(regex, string) {
            var result = regex.exec(string);
            if (result) {
                result = regex.ignoreCase ? result[0].toLowerCase() : result[0];
                return [ result, string.substr(result.length) ];
            }
        }
        function consumeTrimmed(consumer, string) {
            string = string.replace(/^\s*/, "");
            var result = consumer(string);
            if (result) {
                return [ result[0], result[1].replace(/^\s*/, "") ];
            }
        }
        function consumeRepeated(consumer, separator, string) {
            consumer = consumeTrimmed.bind(null, consumer);
            var list = [];
            while (true) {
                var result = consumer(string);
                if (!result) {
                    return [ list, string ];
                }
                list.push(result[0]);
                string = result[1];
                result = consumeToken(separator, string);
                if (!result || result[1] == "") {
                    return [ list, string ];
                }
                string = result[1];
            }
        }
        function consumeParenthesised(parser, string) {
            var nesting = 0;
            for (var n = 0; n < string.length; n++) {
                if (/\s|,/.test(string[n]) && nesting == 0) {
                    break;
                } else if (string[n] == "(") {
                    nesting++;
                } else if (string[n] == ")") {
                    nesting--;
                    if (nesting == 0) n++;
                    if (nesting <= 0) break;
                }
            }
            var parsed = parser(string.substr(0, n));
            return parsed == undefined ? undefined : [ parsed, string.substr(n) ];
        }
        function lcm(a, b) {
            var c = a;
            var d = b;
            while (c && d) c > d ? c %= d : d %= c;
            c = a * b / (c + d);
            return c;
        }
        function ignore(value) {
            return function(input) {
                var result = value(input);
                if (result) result[0] = undefined;
                return result;
            };
        }
        function optional(value, defaultValue) {
            return function(input) {
                var result = value(input);
                if (result) return result;
                return [ defaultValue, input ];
            };
        }
        function consumeList(list, input) {
            var output = [];
            for (var i = 0; i < list.length; i++) {
                var result = scope.consumeTrimmed(list[i], input);
                if (!result || result[0] == "") return;
                if (result[0] !== undefined) output.push(result[0]);
                input = result[1];
            }
            if (input == "") {
                return output;
            }
        }
        function mergeWrappedNestedRepeated(wrap, nestedMerge, separator, left, right) {
            var matchingLeft = [];
            var matchingRight = [];
            var reconsititution = [];
            var length = lcm(left.length, right.length);
            for (var i = 0; i < length; i++) {
                var thing = nestedMerge(left[i % left.length], right[i % right.length]);
                if (!thing) {
                    return;
                }
                matchingLeft.push(thing[0]);
                matchingRight.push(thing[1]);
                reconsititution.push(thing[2]);
            }
            return [ matchingLeft, matchingRight, function(positions) {
                var result = positions.map(function(position, i) {
                    return reconsititution[i](position);
                }).join(separator);
                return wrap ? wrap(result) : result;
            } ];
        }
        function mergeList(left, right, list) {
            var lefts = [];
            var rights = [];
            var functions = [];
            var j = 0;
            for (var i = 0; i < list.length; i++) {
                if (typeof list[i] == "function") {
                    var result = list[i](left[j], right[j++]);
                    lefts.push(result[0]);
                    rights.push(result[1]);
                    functions.push(result[2]);
                } else {
                    (function(pos) {
                        lefts.push(false);
                        rights.push(false);
                        functions.push(function() {
                            return list[pos];
                        });
                    })(i);
                }
            }
            return [ lefts, rights, function(results) {
                var result = "";
                for (var i = 0; i < results.length; i++) {
                    result += functions[i](results[i]);
                }
                return result;
            } ];
        }
        scope.consumeToken = consumeToken;
        scope.consumeTrimmed = consumeTrimmed;
        scope.consumeRepeated = consumeRepeated;
        scope.consumeParenthesised = consumeParenthesised;
        scope.ignore = ignore;
        scope.optional = optional;
        scope.consumeList = consumeList;
        scope.mergeNestedRepeated = mergeWrappedNestedRepeated.bind(null, null);
        scope.mergeWrappedNestedRepeated = mergeWrappedNestedRepeated;
        scope.mergeList = mergeList;
    })(webAnimations1);
    (function(scope) {
        function consumeShadow(string) {
            var shadow = {
                inset: false,
                lengths: [],
                color: null
            };
            function consumePart(string) {
                var result = scope.consumeToken(/^inset/i, string);
                if (result) {
                    shadow.inset = true;
                    return result;
                }
                var result = scope.consumeLengthOrPercent(string);
                if (result) {
                    shadow.lengths.push(result[0]);
                    return result;
                }
                var result = scope.consumeColor(string);
                if (result) {
                    shadow.color = result[0];
                    return result;
                }
            }
            var result = scope.consumeRepeated(consumePart, /^/, string);
            if (result && result[0].length) {
                return [ shadow, result[1] ];
            }
        }
        function parseShadowList(string) {
            var result = scope.consumeRepeated(consumeShadow, /^,/, string);
            if (result && result[1] == "") {
                return result[0];
            }
        }
        function mergeShadow(left, right) {
            while (left.lengths.length < Math.max(left.lengths.length, right.lengths.length)) left.lengths.push({
                px: 0
            });
            while (right.lengths.length < Math.max(left.lengths.length, right.lengths.length)) right.lengths.push({
                px: 0
            });
            if (left.inset != right.inset || !!left.color != !!right.color) {
                return;
            }
            var lengthReconstitution = [];
            var colorReconstitution;
            var matchingLeft = [ [], 0 ];
            var matchingRight = [ [], 0 ];
            for (var i = 0; i < left.lengths.length; i++) {
                var mergedDimensions = scope.mergeDimensions(left.lengths[i], right.lengths[i], i == 2);
                matchingLeft[0].push(mergedDimensions[0]);
                matchingRight[0].push(mergedDimensions[1]);
                lengthReconstitution.push(mergedDimensions[2]);
            }
            if (left.color && right.color) {
                var mergedColor = scope.mergeColors(left.color, right.color);
                matchingLeft[1] = mergedColor[0];
                matchingRight[1] = mergedColor[1];
                colorReconstitution = mergedColor[2];
            }
            return [ matchingLeft, matchingRight, function(value) {
                var result = left.inset ? "inset " : " ";
                for (var i = 0; i < lengthReconstitution.length; i++) {
                    result += lengthReconstitution[i](value[0][i]) + " ";
                }
                if (colorReconstitution) {
                    result += colorReconstitution(value[1]);
                }
                return result;
            } ];
        }
        function mergeNestedRepeatedShadow(nestedMerge, separator, left, right) {
            var leftCopy = [];
            var rightCopy = [];
            function defaultShadow(inset) {
                return {
                    inset: inset,
                    color: [ 0, 0, 0, 0 ],
                    lengths: [ {
                        px: 0
                    }, {
                        px: 0
                    }, {
                        px: 0
                    }, {
                        px: 0
                    } ]
                };
            }
            for (var i = 0; i < left.length || i < right.length; i++) {
                var l = left[i] || defaultShadow(right[i].inset);
                var r = right[i] || defaultShadow(left[i].inset);
                leftCopy.push(l);
                rightCopy.push(r);
            }
            return scope.mergeNestedRepeated(nestedMerge, separator, leftCopy, rightCopy);
        }
        var mergeShadowList = mergeNestedRepeatedShadow.bind(null, mergeShadow, ", ");
        scope.addPropertiesHandler(parseShadowList, mergeShadowList, [ "box-shadow", "text-shadow" ]);
    })(webAnimations1);
    (function(scope, testing) {
        function numberToString(x) {
            return x.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
        }
        function clamp(min, max, x) {
            return Math.min(max, Math.max(min, x));
        }
        function parseNumber(string) {
            if (/^\s*[-+]?(\d*\.)?\d+\s*$/.test(string)) return Number(string);
        }
        function mergeNumbers(left, right) {
            return [ left, right, numberToString ];
        }
        function mergeFlex(left, right) {
            if (left == 0) return;
            return clampedMergeNumbers(0, Infinity)(left, right);
        }
        function mergePositiveIntegers(left, right) {
            return [ left, right, function(x) {
                return Math.round(clamp(1, Infinity, x));
            } ];
        }
        function clampedMergeNumbers(min, max) {
            return function(left, right) {
                return [ left, right, function(x) {
                    return numberToString(clamp(min, max, x));
                } ];
            };
        }
        function parseNumberList(string) {
            var items = string.trim().split(/\s*[\s,]\s*/);
            if (items.length === 0) {
                return;
            }
            var result = [];
            for (var i = 0; i < items.length; i++) {
                var number = parseNumber(items[i]);
                if (number === undefined) {
                    return;
                }
                result.push(number);
            }
            return result;
        }
        function mergeNumberLists(left, right) {
            if (left.length != right.length) {
                return;
            }
            return [ left, right, function(numberList) {
                return numberList.map(numberToString).join(" ");
            } ];
        }
        function round(left, right) {
            return [ left, right, Math.round ];
        }
        scope.clamp = clamp;
        scope.addPropertiesHandler(parseNumberList, mergeNumberLists, [ "stroke-dasharray" ]);
        scope.addPropertiesHandler(parseNumber, clampedMergeNumbers(0, Infinity), [ "border-image-width", "line-height" ]);
        scope.addPropertiesHandler(parseNumber, clampedMergeNumbers(0, 1), [ "opacity", "shape-image-threshold" ]);
        scope.addPropertiesHandler(parseNumber, mergeFlex, [ "flex-grow", "flex-shrink" ]);
        scope.addPropertiesHandler(parseNumber, mergePositiveIntegers, [ "orphans", "widows" ]);
        scope.addPropertiesHandler(parseNumber, round, [ "z-index" ]);
        scope.parseNumber = parseNumber;
        scope.parseNumberList = parseNumberList;
        scope.mergeNumbers = mergeNumbers;
        scope.numberToString = numberToString;
    })(webAnimations1, webAnimationsTesting);
    (function(scope, testing) {
        function merge(left, right) {
            if (left != "visible" && right != "visible") return;
            return [ 0, 1, function(x) {
                if (x <= 0) return left;
                if (x >= 1) return right;
                return "visible";
            } ];
        }
        scope.addPropertiesHandler(String, merge, [ "visibility" ]);
    })(webAnimations1);
    (function(scope, testing) {
        var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
        canvas.width = canvas.height = 1;
        var context = canvas.getContext("2d");
        function parseColor(string) {
            string = string.trim();
            context.fillStyle = "#000";
            context.fillStyle = string;
            var contextSerializedFillStyle = context.fillStyle;
            context.fillStyle = "#fff";
            context.fillStyle = string;
            if (contextSerializedFillStyle != context.fillStyle) return;
            context.fillRect(0, 0, 1, 1);
            var pixelColor = context.getImageData(0, 0, 1, 1).data;
            context.clearRect(0, 0, 1, 1);
            var alpha = pixelColor[3] / 255;
            return [ pixelColor[0] * alpha, pixelColor[1] * alpha, pixelColor[2] * alpha, alpha ];
        }
        function mergeColors(left, right) {
            return [ left, right, function(x) {
                function clamp(v) {
                    return Math.max(0, Math.min(255, v));
                }
                if (x[3]) {
                    for (var i = 0; i < 3; i++) x[i] = Math.round(clamp(x[i] / x[3]));
                }
                x[3] = scope.numberToString(scope.clamp(0, 1, x[3]));
                return "rgba(" + x.join(",") + ")";
            } ];
        }
        scope.addPropertiesHandler(parseColor, mergeColors, [ "background-color", "border-bottom-color", "border-left-color", "border-right-color", "border-top-color", "color", "fill", "flood-color", "lighting-color", "outline-color", "stop-color", "stroke", "text-decoration-color" ]);
        scope.consumeColor = scope.consumeParenthesised.bind(null, parseColor);
        scope.mergeColors = mergeColors;
        if (WEB_ANIMATIONS_TESTING) {
            testing.parseColor = parseColor;
        }
    })(webAnimations1, webAnimationsTesting);
    (function(scope, testing) {
        function calculate(expression) {
            var tokenRegularExpression = /([\+\-\w\.]+|[\(\)\*\/])/g;
            var currentToken;
            function consume() {
                var matchResult = tokenRegularExpression.exec(expression);
                if (matchResult) currentToken = matchResult[0]; else currentToken = undefined;
            }
            consume();
            function calcNumber() {
                var result = Number(currentToken);
                consume();
                return result;
            }
            function calcValue() {
                if (currentToken !== "(") return calcNumber();
                consume();
                var result = calcSum();
                if (currentToken !== ")") return NaN;
                consume();
                return result;
            }
            function calcProduct() {
                var left = calcValue();
                while (currentToken === "*" || currentToken === "/") {
                    var operator = currentToken;
                    consume();
                    var right = calcValue();
                    if (operator === "*") left *= right; else left /= right;
                }
                return left;
            }
            function calcSum() {
                var left = calcProduct();
                while (currentToken === "+" || currentToken === "-") {
                    var operator = currentToken;
                    consume();
                    var right = calcProduct();
                    if (operator === "+") left += right; else left -= right;
                }
                return left;
            }
            return calcSum();
        }
        function parseDimension(unitRegExp, string) {
            string = string.trim().toLowerCase();
            if (string == "0" && "px".search(unitRegExp) >= 0) return {
                px: 0
            };
            if (!/^[^(]*$|^calc/.test(string)) return;
            string = string.replace(/calc\(/g, "(");
            var matchedUnits = {};
            string = string.replace(unitRegExp, function(match) {
                matchedUnits[match] = null;
                return "U" + match;
            });
            var taggedUnitRegExp = "U(" + unitRegExp.source + ")";
            var typeCheck = string.replace(/[-+]?(\d*\.)?\d+([Ee][-+]?\d+)?/g, "N").replace(new RegExp("N" + taggedUnitRegExp, "g"), "D").replace(/\s[+-]\s/g, "O").replace(/\s/g, "");
            var reductions = [ /N\*(D)/g, /(N|D)[*\/]N/g, /(N|D)O\1/g, /\((N|D)\)/g ];
            var i = 0;
            while (i < reductions.length) {
                if (reductions[i].test(typeCheck)) {
                    typeCheck = typeCheck.replace(reductions[i], "$1");
                    i = 0;
                } else {
                    i++;
                }
            }
            if (typeCheck != "D") return;
            for (var unit in matchedUnits) {
                var result = calculate(string.replace(new RegExp("U" + unit, "g"), "").replace(new RegExp(taggedUnitRegExp, "g"), "*0"));
                if (!isFinite(result)) return;
                matchedUnits[unit] = result;
            }
            return matchedUnits;
        }
        function mergeDimensionsNonNegative(left, right) {
            return mergeDimensions(left, right, true);
        }
        function mergeDimensions(left, right, nonNegative) {
            var units = [], unit;
            for (unit in left) units.push(unit);
            for (unit in right) {
                if (units.indexOf(unit) < 0) units.push(unit);
            }
            left = units.map(function(unit) {
                return left[unit] || 0;
            });
            right = units.map(function(unit) {
                return right[unit] || 0;
            });
            return [ left, right, function(values) {
                var result = values.map(function(value, i) {
                    if (values.length == 1 && nonNegative) {
                        value = Math.max(value, 0);
                    }
                    return scope.numberToString(value) + units[i];
                }).join(" + ");
                return values.length > 1 ? "calc(" + result + ")" : result;
            } ];
        }
        var lengthUnits = "px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc";
        var parseLength = parseDimension.bind(null, new RegExp(lengthUnits, "g"));
        var parseLengthOrPercent = parseDimension.bind(null, new RegExp(lengthUnits + "|%", "g"));
        var parseAngle = parseDimension.bind(null, /deg|rad|grad|turn/g);
        scope.parseLength = parseLength;
        scope.parseLengthOrPercent = parseLengthOrPercent;
        scope.consumeLengthOrPercent = scope.consumeParenthesised.bind(null, parseLengthOrPercent);
        scope.parseAngle = parseAngle;
        scope.mergeDimensions = mergeDimensions;
        var consumeLength = scope.consumeParenthesised.bind(null, parseLength);
        var consumeSizePair = scope.consumeRepeated.bind(undefined, consumeLength, /^/);
        var consumeSizePairList = scope.consumeRepeated.bind(undefined, consumeSizePair, /^,/);
        scope.consumeSizePairList = consumeSizePairList;
        var parseSizePairList = function(input) {
            var result = consumeSizePairList(input);
            if (result && result[1] == "") {
                return result[0];
            }
        };
        var mergeNonNegativeSizePair = scope.mergeNestedRepeated.bind(undefined, mergeDimensionsNonNegative, " ");
        var mergeNonNegativeSizePairList = scope.mergeNestedRepeated.bind(undefined, mergeNonNegativeSizePair, ",");
        scope.mergeNonNegativeSizePair = mergeNonNegativeSizePair;
        scope.addPropertiesHandler(parseSizePairList, mergeNonNegativeSizePairList, [ "background-size" ]);
        scope.addPropertiesHandler(parseLengthOrPercent, mergeDimensionsNonNegative, [ "border-bottom-width", "border-image-width", "border-left-width", "border-right-width", "border-top-width", "flex-basis", "font-size", "height", "line-height", "max-height", "max-width", "outline-width", "width" ]);
        scope.addPropertiesHandler(parseLengthOrPercent, mergeDimensions, [ "border-bottom-left-radius", "border-bottom-right-radius", "border-top-left-radius", "border-top-right-radius", "bottom", "left", "letter-spacing", "margin-bottom", "margin-left", "margin-right", "margin-top", "min-height", "min-width", "outline-offset", "padding-bottom", "padding-left", "padding-right", "padding-top", "perspective", "right", "shape-margin", "stroke-dashoffset", "text-indent", "top", "vertical-align", "word-spacing" ]);
    })(webAnimations1, webAnimationsTesting);
    (function(scope, testing) {
        function consumeLengthPercentOrAuto(string) {
            return scope.consumeLengthOrPercent(string) || scope.consumeToken(/^auto/, string);
        }
        function parseBox(string) {
            var result = scope.consumeList([ scope.ignore(scope.consumeToken.bind(null, /^rect/)), scope.ignore(scope.consumeToken.bind(null, /^\(/)), scope.consumeRepeated.bind(null, consumeLengthPercentOrAuto, /^,/), scope.ignore(scope.consumeToken.bind(null, /^\)/)) ], string);
            if (result && result[0].length == 4) {
                return result[0];
            }
        }
        function mergeComponent(left, right) {
            if (left == "auto" || right == "auto") {
                return [ true, false, function(t) {
                    var result = t ? left : right;
                    if (result == "auto") {
                        return "auto";
                    }
                    var merged = scope.mergeDimensions(result, result);
                    return merged[2](merged[0]);
                } ];
            }
            return scope.mergeDimensions(left, right);
        }
        function wrap(result) {
            return "rect(" + result + ")";
        }
        var mergeBoxes = scope.mergeWrappedNestedRepeated.bind(null, wrap, mergeComponent, ", ");
        scope.parseBox = parseBox;
        scope.mergeBoxes = mergeBoxes;
        scope.addPropertiesHandler(parseBox, mergeBoxes, [ "clip" ]);
    })(webAnimations1, webAnimationsTesting);
    (function(scope, testing) {
        var _ = null;
        function cast(pattern) {
            return function(contents) {
                var i = 0;
                return pattern.map(function(x) {
                    return x === _ ? contents[i++] : x;
                });
            };
        }
        function id(x) {
            return x;
        }
        var Opx = {
            px: 0
        };
        var Odeg = {
            deg: 0
        };
        var transformFunctions = {
            matrix: [ "NNNNNN", [ _, _, 0, 0, _, _, 0, 0, 0, 0, 1, 0, _, _, 0, 1 ], id ],
            matrix3d: [ "NNNNNNNNNNNNNNNN", id ],
            rotate: [ "A" ],
            rotatex: [ "A" ],
            rotatey: [ "A" ],
            rotatez: [ "A" ],
            rotate3d: [ "NNNA" ],
            perspective: [ "L" ],
            scale: [ "Nn", cast([ _, _, 1 ]), id ],
            scalex: [ "N", cast([ _, 1, 1 ]), cast([ _, 1 ]) ],
            scaley: [ "N", cast([ 1, _, 1 ]), cast([ 1, _ ]) ],
            scalez: [ "N", cast([ 1, 1, _ ]) ],
            scale3d: [ "NNN", id ],
            skew: [ "Aa", null, id ],
            skewx: [ "A", null, cast([ _, Odeg ]) ],
            skewy: [ "A", null, cast([ Odeg, _ ]) ],
            translate: [ "Tt", cast([ _, _, Opx ]), id ],
            translatex: [ "T", cast([ _, Opx, Opx ]), cast([ _, Opx ]) ],
            translatey: [ "T", cast([ Opx, _, Opx ]), cast([ Opx, _ ]) ],
            translatez: [ "L", cast([ Opx, Opx, _ ]) ],
            translate3d: [ "TTL", id ]
        };
        function parseTransform(string) {
            string = string.toLowerCase().trim();
            if (string == "none") return [];
            var transformRegExp = /\s*(\w+)\(([^)]*)\)/g;
            var result = [];
            var match;
            var prevLastIndex = 0;
            while (match = transformRegExp.exec(string)) {
                if (match.index != prevLastIndex) return;
                prevLastIndex = match.index + match[0].length;
                var functionName = match[1];
                var functionData = transformFunctions[functionName];
                if (!functionData) return;
                var args = match[2].split(",");
                var argTypes = functionData[0];
                if (argTypes.length < args.length) return;
                var parsedArgs = [];
                for (var i = 0; i < argTypes.length; i++) {
                    var arg = args[i];
                    var type = argTypes[i];
                    var parsedArg;
                    if (!arg) parsedArg = {
                        a: Odeg,
                        n: parsedArgs[0],
                        t: Opx
                    }[type]; else parsedArg = {
                        A: function(s) {
                            return s.trim() == "0" ? Odeg : scope.parseAngle(s);
                        },
                        N: scope.parseNumber,
                        T: scope.parseLengthOrPercent,
                        L: scope.parseLength
                    }[type.toUpperCase()](arg);
                    if (parsedArg === undefined) return;
                    parsedArgs.push(parsedArg);
                }
                result.push({
                    t: functionName,
                    d: parsedArgs
                });
                if (transformRegExp.lastIndex == string.length) return result;
            }
        }
        function numberToLongString(x) {
            return x.toFixed(6).replace(".000000", "");
        }
        function mergeMatrices(left, right) {
            if (left.decompositionPair !== right) {
                left.decompositionPair = right;
                var leftArgs = scope.makeMatrixDecomposition(left);
            }
            if (right.decompositionPair !== left) {
                right.decompositionPair = left;
                var rightArgs = scope.makeMatrixDecomposition(right);
            }
            if (leftArgs[0] == null || rightArgs[0] == null) return [ [ false ], [ true ], function(x) {
                return x ? right[0].d : left[0].d;
            } ];
            leftArgs[0].push(0);
            rightArgs[0].push(1);
            return [ leftArgs, rightArgs, function(list) {
                var quat = scope.quat(leftArgs[0][3], rightArgs[0][3], list[5]);
                var mat = scope.composeMatrix(list[0], list[1], list[2], quat, list[4]);
                var stringifiedArgs = mat.map(numberToLongString).join(",");
                return stringifiedArgs;
            } ];
        }
        function typeTo2D(type) {
            return type.replace(/[xy]/, "");
        }
        function typeTo3D(type) {
            return type.replace(/(x|y|z|3d)?$/, "3d");
        }
        function mergeTransforms(left, right) {
            var matrixModulesLoaded = scope.makeMatrixDecomposition && true;
            var flipResults = false;
            if (!left.length || !right.length) {
                if (!left.length) {
                    flipResults = true;
                    left = right;
                    right = [];
                }
                for (var i = 0; i < left.length; i++) {
                    var type = left[i].t;
                    var args = left[i].d;
                    var defaultValue = type.substr(0, 5) == "scale" ? 1 : 0;
                    right.push({
                        t: type,
                        d: args.map(function(arg) {
                            if (typeof arg == "number") return defaultValue;
                            var result = {};
                            for (var unit in arg) result[unit] = defaultValue;
                            return result;
                        })
                    });
                }
            }
            var isMatrixOrPerspective = function(lt, rt) {
                return lt == "perspective" && rt == "perspective" || (lt == "matrix" || lt == "matrix3d") && (rt == "matrix" || rt == "matrix3d");
            };
            var leftResult = [];
            var rightResult = [];
            var types = [];
            if (left.length != right.length) {
                if (!matrixModulesLoaded) return;
                var merged = mergeMatrices(left, right);
                leftResult = [ merged[0] ];
                rightResult = [ merged[1] ];
                types = [ [ "matrix", [ merged[2] ] ] ];
            } else {
                for (var i = 0; i < left.length; i++) {
                    var leftType = left[i].t;
                    var rightType = right[i].t;
                    var leftArgs = left[i].d;
                    var rightArgs = right[i].d;
                    var leftFunctionData = transformFunctions[leftType];
                    var rightFunctionData = transformFunctions[rightType];
                    var type;
                    if (isMatrixOrPerspective(leftType, rightType)) {
                        if (!matrixModulesLoaded) return;
                        var merged = mergeMatrices([ left[i] ], [ right[i] ]);
                        leftResult.push(merged[0]);
                        rightResult.push(merged[1]);
                        types.push([ "matrix", [ merged[2] ] ]);
                        continue;
                    } else if (leftType == rightType) {
                        type = leftType;
                    } else if (leftFunctionData[2] && rightFunctionData[2] && typeTo2D(leftType) == typeTo2D(rightType)) {
                        type = typeTo2D(leftType);
                        leftArgs = leftFunctionData[2](leftArgs);
                        rightArgs = rightFunctionData[2](rightArgs);
                    } else if (leftFunctionData[1] && rightFunctionData[1] && typeTo3D(leftType) == typeTo3D(rightType)) {
                        type = typeTo3D(leftType);
                        leftArgs = leftFunctionData[1](leftArgs);
                        rightArgs = rightFunctionData[1](rightArgs);
                    } else {
                        if (!matrixModulesLoaded) return;
                        var merged = mergeMatrices(left, right);
                        leftResult = [ merged[0] ];
                        rightResult = [ merged[1] ];
                        types = [ [ "matrix", [ merged[2] ] ] ];
                        break;
                    }
                    var leftArgsCopy = [];
                    var rightArgsCopy = [];
                    var stringConversions = [];
                    for (var j = 0; j < leftArgs.length; j++) {
                        var merge = typeof leftArgs[j] == "number" ? scope.mergeNumbers : scope.mergeDimensions;
                        var merged = merge(leftArgs[j], rightArgs[j]);
                        leftArgsCopy[j] = merged[0];
                        rightArgsCopy[j] = merged[1];
                        stringConversions.push(merged[2]);
                    }
                    leftResult.push(leftArgsCopy);
                    rightResult.push(rightArgsCopy);
                    types.push([ type, stringConversions ]);
                }
            }
            if (flipResults) {
                var tmp = leftResult;
                leftResult = rightResult;
                rightResult = tmp;
            }
            return [ leftResult, rightResult, function(list) {
                return list.map(function(args, i) {
                    var stringifiedArgs = args.map(function(arg, j) {
                        return types[i][1][j](arg);
                    }).join(",");
                    if (types[i][0] == "matrix" && stringifiedArgs.split(",").length == 16) types[i][0] = "matrix3d";
                    return types[i][0] + "(" + stringifiedArgs + ")";
                }).join(" ");
            } ];
        }
        scope.addPropertiesHandler(parseTransform, mergeTransforms, [ "transform" ]);
        scope.transformToSvgMatrix = function(string) {
            var mat = scope.transformListToMatrix(parseTransform(string));
            return "matrix(" + numberToLongString(mat[0]) + " " + numberToLongString(mat[1]) + " " + numberToLongString(mat[4]) + " " + numberToLongString(mat[5]) + " " + numberToLongString(mat[12]) + " " + numberToLongString(mat[13]) + ")";
        };
        if (WEB_ANIMATIONS_TESTING) testing.parseTransform = parseTransform;
    })(webAnimations1, webAnimationsTesting);
    (function(scope) {
        function parse(string) {
            var out = Number(string);
            if (isNaN(out) || out < 100 || out > 900 || out % 100 !== 0) {
                return;
            }
            return out;
        }
        function toCss(value) {
            value = Math.round(value / 100) * 100;
            value = scope.clamp(100, 900, value);
            if (value === 400) {
                return "normal";
            }
            if (value === 700) {
                return "bold";
            }
            return String(value);
        }
        function merge(left, right) {
            return [ left, right, toCss ];
        }
        scope.addPropertiesHandler(parse, merge, [ "font-weight" ]);
    })(webAnimations1);
    (function(scope) {
        function negateDimension(dimension) {
            var result = {};
            for (var k in dimension) {
                result[k] = -dimension[k];
            }
            return result;
        }
        function consumeOffset(string) {
            return scope.consumeToken(/^(left|center|right|top|bottom)\b/i, string) || scope.consumeLengthOrPercent(string);
        }
        var offsetMap = {
            left: {
                "%": 0
            },
            center: {
                "%": 50
            },
            right: {
                "%": 100
            },
            top: {
                "%": 0
            },
            bottom: {
                "%": 100
            }
        };
        function parseOrigin(slots, string) {
            var result = scope.consumeRepeated(consumeOffset, /^/, string);
            if (!result || result[1] != "") return;
            var tokens = result[0];
            tokens[0] = tokens[0] || "center";
            tokens[1] = tokens[1] || "center";
            if (slots == 3) {
                tokens[2] = tokens[2] || {
                    px: 0
                };
            }
            if (tokens.length != slots) {
                return;
            }
            if (/top|bottom/.test(tokens[0]) || /left|right/.test(tokens[1])) {
                var tmp = tokens[0];
                tokens[0] = tokens[1];
                tokens[1] = tmp;
            }
            if (!/left|right|center|Object/.test(tokens[0])) return;
            if (!/top|bottom|center|Object/.test(tokens[1])) return;
            return tokens.map(function(position) {
                return typeof position == "object" ? position : offsetMap[position];
            });
        }
        var mergeOffsetList = scope.mergeNestedRepeated.bind(null, scope.mergeDimensions, " ");
        scope.addPropertiesHandler(parseOrigin.bind(null, 3), mergeOffsetList, [ "transform-origin" ]);
        scope.addPropertiesHandler(parseOrigin.bind(null, 2), mergeOffsetList, [ "perspective-origin" ]);
        function consumePosition(string) {
            var result = scope.consumeRepeated(consumeOffset, /^/, string);
            if (!result) {
                return;
            }
            var tokens = result[0];
            var out = [ {
                "%": 50
            }, {
                "%": 50
            } ];
            var pos = 0;
            var bottomOrRight = false;
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                if (typeof token == "string") {
                    bottomOrRight = /bottom|right/.test(token);
                    pos = {
                        left: 0,
                        right: 0,
                        center: pos,
                        top: 1,
                        bottom: 1
                    }[token];
                    out[pos] = offsetMap[token];
                    if (token == "center") {
                        pos++;
                    }
                } else {
                    if (bottomOrRight) {
                        token = negateDimension(token);
                        token["%"] = (token["%"] || 0) + 100;
                    }
                    out[pos] = token;
                    pos++;
                    bottomOrRight = false;
                }
            }
            return [ out, result[1] ];
        }
        function parsePositionList(string) {
            var result = scope.consumeRepeated(consumePosition, /^,/, string);
            if (result && result[1] == "") {
                return result[0];
            }
        }
        scope.consumePosition = consumePosition;
        scope.mergeOffsetList = mergeOffsetList;
        var mergePositionList = scope.mergeNestedRepeated.bind(null, mergeOffsetList, ", ");
        scope.addPropertiesHandler(parsePositionList, mergePositionList, [ "background-position", "object-position" ]);
    })(webAnimations1);
    (function(scope) {
        var consumeLengthOrPercent = scope.consumeParenthesised.bind(null, scope.parseLengthOrPercent);
        var consumeLengthOrPercentPair = scope.consumeRepeated.bind(undefined, consumeLengthOrPercent, /^/);
        var mergeSizePair = scope.mergeNestedRepeated.bind(undefined, scope.mergeDimensions, " ");
        var mergeSizePairList = scope.mergeNestedRepeated.bind(undefined, mergeSizePair, ",");
        function parseShape(input) {
            var circle = scope.consumeToken(/^circle/, input);
            if (circle && circle[0]) {
                return [ "circle" ].concat(scope.consumeList([ scope.ignore(scope.consumeToken.bind(undefined, /^\(/)), consumeLengthOrPercent, scope.ignore(scope.consumeToken.bind(undefined, /^at/)), scope.consumePosition, scope.ignore(scope.consumeToken.bind(undefined, /^\)/)) ], circle[1]));
            }
            var ellipse = scope.consumeToken(/^ellipse/, input);
            if (ellipse && ellipse[0]) {
                return [ "ellipse" ].concat(scope.consumeList([ scope.ignore(scope.consumeToken.bind(undefined, /^\(/)), consumeLengthOrPercentPair, scope.ignore(scope.consumeToken.bind(undefined, /^at/)), scope.consumePosition, scope.ignore(scope.consumeToken.bind(undefined, /^\)/)) ], ellipse[1]));
            }
            var polygon = scope.consumeToken(/^polygon/, input);
            if (polygon && polygon[0]) {
                return [ "polygon" ].concat(scope.consumeList([ scope.ignore(scope.consumeToken.bind(undefined, /^\(/)), scope.optional(scope.consumeToken.bind(undefined, /^nonzero\s*,|^evenodd\s*,/), "nonzero,"), scope.consumeSizePairList, scope.ignore(scope.consumeToken.bind(undefined, /^\)/)) ], polygon[1]));
            }
        }
        function mergeShapes(left, right) {
            if (left[0] !== right[0]) return;
            if (left[0] == "circle") {
                return scope.mergeList(left.slice(1), right.slice(1), [ "circle(", scope.mergeDimensions, " at ", scope.mergeOffsetList, ")" ]);
            }
            if (left[0] == "ellipse") {
                return scope.mergeList(left.slice(1), right.slice(1), [ "ellipse(", scope.mergeNonNegativeSizePair, " at ", scope.mergeOffsetList, ")" ]);
            }
            if (left[0] == "polygon" && left[1] == right[1]) {
                return scope.mergeList(left.slice(2), right.slice(2), [ "polygon(", left[1], mergeSizePairList, ")" ]);
            }
        }
        scope.addPropertiesHandler(parseShape, mergeShapes, [ "shape-outside" ]);
    })(webAnimations1);
    (function(scope, testing) {
        var prefixed = {};
        var unprefixed = {};
        function alias(name, aliases) {
            aliases.concat([ name ]).forEach(function(candidate) {
                if (candidate in document.documentElement.style) {
                    prefixed[name] = candidate;
                }
                unprefixed[candidate] = name;
            });
        }
        alias("transform", [ "webkitTransform", "msTransform" ]);
        alias("transformOrigin", [ "webkitTransformOrigin" ]);
        alias("perspective", [ "webkitPerspective" ]);
        alias("perspectiveOrigin", [ "webkitPerspectiveOrigin" ]);
        scope.propertyName = function(property) {
            return prefixed[property] || property;
        };
        scope.unprefixedPropertyName = function(property) {
            return unprefixed[property] || property;
        };
    })(webAnimations1, webAnimationsTesting);
})();

(function() {
    if (document.createElement("div").animate([]).oncancel !== undefined) {
        return;
    }
    if (WEB_ANIMATIONS_TESTING) {
        var now = function() {
            return webAnimations1.timeline.currentTime;
        };
    } else if (window.performance && performance.now) {
        var now = function() {
            return performance.now();
        };
    } else {
        var now = function() {
            return Date.now();
        };
    }
    var AnimationCancelEvent = function(target, currentTime, timelineTime) {
        this.target = target;
        this.currentTime = currentTime;
        this.timelineTime = timelineTime;
        this.type = "cancel";
        this.bubbles = false;
        this.cancelable = false;
        this.currentTarget = target;
        this.defaultPrevented = false;
        this.eventPhase = Event.AT_TARGET;
        this.timeStamp = Date.now();
    };
    var originalElementAnimate = window.Element.prototype.animate;
    window.Element.prototype.animate = function(effectInput, options) {
        var animation = originalElementAnimate.call(this, effectInput, options);
        animation._cancelHandlers = [];
        animation.oncancel = null;
        var originalCancel = animation.cancel;
        animation.cancel = function() {
            originalCancel.call(this);
            var event = new AnimationCancelEvent(this, null, now());
            var handlers = this._cancelHandlers.concat(this.oncancel ? [ this.oncancel ] : []);
            setTimeout(function() {
                handlers.forEach(function(handler) {
                    handler.call(event.target, event);
                });
            }, 0);
        };
        var originalAddEventListener = animation.addEventListener;
        animation.addEventListener = function(type, handler) {
            if (typeof handler == "function" && type == "cancel") this._cancelHandlers.push(handler); else originalAddEventListener.call(this, type, handler);
        };
        var originalRemoveEventListener = animation.removeEventListener;
        animation.removeEventListener = function(type, handler) {
            if (type == "cancel") {
                var index = this._cancelHandlers.indexOf(handler);
                if (index >= 0) this._cancelHandlers.splice(index, 1);
            } else {
                originalRemoveEventListener.call(this, type, handler);
            }
        };
        return animation;
    };
})();

(function(shared) {
    var element = document.documentElement;
    var animation = null;
    var animated = false;
    try {
        var originalOpacity = getComputedStyle(element).getPropertyValue("opacity");
        var testOpacity = originalOpacity == "0" ? "1" : "0";
        animation = element.animate({
            opacity: [ testOpacity, testOpacity ]
        }, {
            duration: 1
        });
        animation.currentTime = 0;
        animated = getComputedStyle(element).getPropertyValue("opacity") == testOpacity;
    } catch (error) {} finally {
        if (animation) animation.cancel();
    }
    if (animated) {
        return;
    }
    var originalElementAnimate = window.Element.prototype.animate;
    window.Element.prototype.animate = function(effectInput, options) {
        if (window.Symbol && Symbol.iterator && Array.prototype.from && effectInput[Symbol.iterator]) {
            effectInput = Array.from(effectInput);
        }
        if (!Array.isArray(effectInput) && effectInput !== null) {
            effectInput = shared.convertToArrayForm(effectInput);
        }
        return originalElementAnimate.call(this, effectInput, options);
    };
})(webAnimationsShared);
//# sourceMappingURL=web-animations.min.js.map