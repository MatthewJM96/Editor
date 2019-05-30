var contrastModeOn = false;
var helpMenu   = { show: false };
var resetModal = { show: false };
var saveModal  = { show: false };

function toggleContrast() {
    var text = document.querySelector("#text");

    if (contrastModeOn) {
        text.style.backgroundColor = "rgb(234,234,234)";
        text.style.color = "rgb(58,58,58)";
    } else {
        text.style.backgroundColor = "rgb(0,0,0)";
        text.style.color = "rgb(202,202,202)";
    }

    contrastModeOn = !contrastModeOn;
}


EasingFunctions = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity 
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity 
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration 
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity 
    easeInQuart: function (t) { return t*t*t*t },
    // decelerating to zero velocity 
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration 
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}

function AnimationManager(_duration, _stepSize, _startWidth, _endWidth, _startHeight, _endHeight, _startOpacity, _endOpacity, _selector, _display, _entity, _easingFunc = EasingFunctions.linear, _widthUnit = "vw", _heightUnit = "vh") {
    var timerID = null;

    var element  = document.querySelector(_selector);

    var complete = false;

    var step = 0;

    var totalSteps = _duration / _stepSize;

    function frame() {
        if (complete && !_entity.show) complete = false;
        if (complete &&  _entity.show) {
            clearInterval(timerID);
            timerID = null;

            return;
        } else if (!_entity.show && step === 0) {
            element.style.display = "none";

            clearInterval(timerID);
            timerID = null;

            return;
        }
        if (_entity.show) {
            if (window.getComputedStyle(element).getPropertyValue("display") === "none") {
                element.style.display = _display;
            }
        }

        var currWidth      = null;
        var currMarginLeft = null;
        if (_endWidth !== null && _startWidth !== null) {
            let widthRange = _endWidth - _startWidth;

            currWidth  = _startWidth + widthRange * _easingFunc(step / totalSteps);
            currMarginLeft = (widthRange  / 2) * (1 - _easingFunc(step / totalSteps));
        }

        var currHeight    = null;
        var currMarginTop = null;
        if (_endHeight !== null && _startHeight !== null) {
            let heightRange = _endHeight - _startHeight;

            currHeight  = _startHeight + heightRange * _easingFunc(step / totalSteps);
            currMarginTop  = (heightRange / 2) * (1 - _easingFunc(step / totalSteps));
        }

        var currOpacity = null;
        {
            let opacityRange = _endOpacity - _startOpacity;

            currOpacity = _startOpacity + opacityRange * _easingFunc(step / totalSteps);
        }

        if (currWidth !== null) {
            element.style.width      = currWidth + _widthUnit;
            element.style.marginLeft = (currMarginLeft + ((100 - _endWidth) / 2)) + _widthUnit;
        }
        if (currHeight !== null) {
            element.style.height    = currHeight + _heightUnit;
            element.style.marginTop = (currMarginTop + ((100 - _endHeight) / 2) - 100) + _heightUnit;
        }
        element.style.opacity    = currOpacity;

        if (step === totalSteps) {
            complete = true;
        }

        if (_entity.show) {
            step++;
        } else {
            step--;
        }
    }

    timerID = setInterval(frame, _stepSize);
    
    return {
        resumeFrames: function() {
            if (timerID === null) {
                timerID = setInterval(frame, _stepSize);
            }
        }
    }
}

var HelpAM  = AnimationManager(70, 10, 55, 60, null, null, 0, 1, "#help",  "inline-block", helpMenu,  EasingFunctions.easeInOutCubic);
var ResetAM = AnimationManager(70, 10, 39, 44, null, null, 0, 1, "#reset", "inline-block", resetModal,  EasingFunctions.easeInOutCubic);
var SaveAM  = AnimationManager(70, 10, 39, 44, null, null, 0, 1, "#save",  "inline-block", saveModal,  EasingFunctions.easeInOutCubic);

function toggleHelp() {
    var oldShow = helpMenu.show;

    helpMenu.show = !helpMenu.show && !resetModal.show && !saveModal.show;

    if (oldShow !== helpMenu.show) {
        HelpAM.resumeFrames();
    }
}

function toggleReset() {
    var oldShow = resetModal.show;

    resetModal.show = !resetModal.show && !saveModal.show && !helpMenu.show;

    if (oldShow !== resetModal.show) {
        ResetAM.resumeFrames();
    }
}

function toggleSave() {
    var oldShow = saveModal.show;

    saveModal.show = !saveModal.show && !helpMenu.show && !resetModal.show;

    if (oldShow !== saveModal.show) {
        SaveAM.resumeFrames();
    }
}

function resetEditor() {
    var text = document.querySelector("#text");

    text.value = "";

    toggleReset();
}

function save() {
    var text     = document.querySelector("#text").value;
    var filename = document.querySelector("#save input").value;

    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename + ".txt");
}

function preventDefault(evt) {
    if (evt.preventDefault) {
        evt.preventDefault();
    } else {
        evt.returnValue = false;
    }
}

function preventEdit(e) {
    var evt = e || window.event;
    if (evt) {
        var keyCode = evt.charCode || evt.keyCode;
        if (keyCode === 8 /* backspace */ || keyCode === 46 /* delete */ ||
            keyCode === 37 /* <-- */      || keyCode === 39 /* --> */) {
            preventDefault(evt);
        }
        
//                if (keyCode === 68 /* d */) {
//                    var text = document.querySelector("#text");
//
//                    var startPos = text.selectionStart;
//                    var endPos   = text.selectionEnd;
//                    var length   = text.value.length;
//
//                    if (startPos === endPos) return;
//
//                    function strikethrough(text) {
//                        return text
//                            .split('')
//                            .map(char => char + '\u0336')
//                            .join('')
//                    }
//
//                    var selection = text.value.substring(startPos, endPos);
//
//                    text.value = text.value.substring(0, startPos) + strikethrough(selection) + text.value.substring(endPos);
//                } else

        if (!(evt.ctrlKey || evt.metaKey)) {
            if ((keyCode >= 48  /* 0 */ && keyCode <= 90  /* z */) ||
                (keyCode >= 106 /* * */ && keyCode <= 111 /* / */) ||
                (keyCode >= 186 /* ; */ && keyCode <= 192 /* ` */) ||
                (keyCode >= 219 /* ( */ && keyCode <= 222 /* ' */)) {
                var text = document.querySelector("#text");

                var startPos = text.selectionStart;
                var endPos   = text.selectionEnd;
                var length   = text.value.length;

                if ((startPos !== endPos) ||
                        (endPos !== length)) {
                    preventDefault(evt);
                }
            }
        }
    }
}

function handlePaste(e) {
    var evt = e || window.event;

    var text = document.querySelector("#text");

    var startPos = text.selectionStart;
    var endPos   = text.selectionEnd;
    var length   = text.value.length;

    if ((endPos !== startPos) || (endPos !== length)) {
        preventDefault(evt);
    }
}

function handleShortcuts(e) {
    var evt = e || window.event;
    if (evt) {
        var keyCode = evt.charCode || evt.keyCode;
        if (evt.ctrlKey || evt.metaKey) {
            if (keyCode !== 67 /* c */ && keyCode !== 86 /* v */
                    && keyCode !== 173 /* - */ && keyCode !== 61 /* = */
                    && keyCode !== 65 /* a */) {
                preventDefault(evt);
            }

            if (keyCode === 75) {
                toggleContrast();
            } else if (keyCode === 72 /* h */) {
                toggleHelp();
            } else if (keyCode === 82 /* r */) {
                toggleReset();
            } else if (keyCode === 83 /* s */) {
                toggleSave();
            }
        }
    }
}
