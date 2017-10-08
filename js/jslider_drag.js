//jslider_drag.js
var JSlider_movingobject = null;
var JSlider_mouseX = 0;
var JSlider_mouseY = 0;
function determineMousePosition(e) {
  JSlider_mouseX = (document.all)?
    e.clientX + document.body.scrollLeft:
    e.clientX + window.pageXOffset;
  JSlider_mouseY = (document.all)?
    e.clientY + document.body.scrollTop:
    e.clientY + window.pageYOffset
}
function startmove(e,element) {			
  determineMousePosition(e);			
  element._offsetX = JSlider_mouseX - element.offsetLeft;
  element._offsetY = JSlider_mouseY - element.offsetTop;
  element._zIndex = element.style.zIndex;
  element.style.zIndex=1000;
  JSlider_movingobject = element;
}
function endMove() {
  if (null != JSlider_movingobject) {
    JSlider_movingobject.style.zIndex = JSlider_movingobject._zIndex;
    JSlider_movingobject = null;
  }
}
function moveobjectX(e, oOrientation) {
  if (null != JSlider_movingobject) {
    determineMousePosition(e);
    JSlider_movingobject.style.left = JSlider_mouseX - JSlider_movingobject._offsetX;
  }
}
function moveobjectY(e, oOrientation){
  if (null != JSlider_movingobject) {
    determineMousePosition(e);
    JSlider_movingobject.style.top = JSlider_mouseY - JSlider_movingobject._offsetY;
  }
}


