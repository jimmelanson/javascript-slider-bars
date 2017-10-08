/*

        JSlider JavaScript Library

        Created 2006, James Melanson, jmelanson1965@gmail.com

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

*/


var createMode = 0;

function disableselect(e){
    return false;
} 

function reEnable(){
  ;return true
} 
document.onselectstart=new Function ("return false") 
if (window.sidebar){
  document.onmousedown=disableselect;
  document.onclick=reEnable;
}
//End of cancel select code

var JmOoJpJSliderNumVal = 0;

function JSlider (oCaller) {
  if(!oCaller) {
    window.alert('You did not provide the caller name for the slider object instantiation. Was that too cryptic?');
    return false;
  }
  this.caller = oCaller;

  JmOoJpJSliderNumVal++;
  this.id = JmOoJpJSliderNumVal;

  this.trackDivId = 'JmOoJpJPath'+this.id.toString();
  this.knobDivId = 'JmOoJpJKnob'+this.id.toString();
  this.knobTextDivId = 'JmOoJpJKnobText'+this.id.toString();
  this.locked = false;
  //Normal Up State settings
  this.horizontal = 0;
  this.vertical = 1;
  this.trackLength; //Always the long axis, *No Rollover
  this.trackWidth = '3';    //Always the short axis, *No Rollover
  this.trackColor = '#000000';

  this.pathWidth = '5'; //*No Rollover
  this.pathColor = '#FFFCAD';
  this.pathStyle = 'solid';
  
  this.knobBGColor = '#F5F5F5';
  this.knobWidth = 20; //*No Rollover
  this.knobHeight = 20; //*No Rollover

  this.knobBorderWidth = 3;
  this.knobBorderStyle = 'outset';
  this.knobBorderColour = '#A9A9A9';
  this.knobBorder = '';

  this.knobText = '';
  this.knobFontFamily = 'tahoma,sans-serif';
  this.knobFontSize = 9; //*No Rollover
  this.knobFontColor = '#FF0000';
  this.knobFontWeight = 'normal'; //*No Rollover

  //Rollover settings
  this.trackColorRollover = this.trackColor; //Inherits
  this.pathColorRollover = this.pathColor;   //Inherits
  this.pathStyleRollover = this.pathStyle;   //Inherits
  this.knobBGColorRollover = '#CDCDCD';

  this.knobBorderStyleRollover = 'outset';
  this.knobBorderColorRollover = '#A9A9A9';
  this.knobBorderRollover = '';


  this.knobTextRollover = '';
  this.knobFontFamilyRollover = this.knobFontFamily;
  this.knobFontColorRollover = this.knobFontColor;

  //Track Actions
  this.trackMinValue = new Number(0);   //This is the minimum value the track represents, usually zero.
  this.trackMaxValue = new Number(100); //This is the maximum value the track represents, defaults to 100.
  this.pixelsPerUnit = new Number(3);
  this.unitIncrements = 'integer';
  this.unitIncrementsValue = new Number(1);

  this.trackValueUpdate = '';        //Argument is an elementID that the knob should update when it is moved.
  this.trackValueUpdateType = '';    //form, nonform
  this.trackValueUpdateFormat = 'integer';  //Format of the update output (dollar, decimal, integer, etc.)

  this.trackNotify = false;   //Boolean value, off or on.

  //Not for public update
  this.orientationValue = 'horizontal'; //Direction the track is layed out. Defaults to horizontal, other option is "vertical"
  this.trackCurrentValue = this.trackMinValue; //Current mathematical representation of the track position compared to min/max values.

  this.trackFullWidth = 0;
  this.trackFullHeight = 0;
  this.knobFullWidth = 0;
  this.knobFullHeight = 0;

  this.slider = function() {
    if(_calculate_dimensions(this)) {
      _print_track_knob(this);
      this.autotrack();
    }
  }
  this.autotrack = function() {
    var valueForCalculation = 0;
    var noMinMax = 1;
    // Get the current X of the left edge of the knob
    var checkX = document.getElementById(this.knobDivId).style.left;
    checkX = parseInt(checkX.substr(0, (checkX.length - 2)));
    // Get the current Y of the top edge of the knob.
    var checkY = document.getElementById(this.knobDivId).style.top;
    checkY = parseInt(checkY.substr(0, (checkY.length - 2)));
    if(this.horizontal) {
      valueForCalculation = checkX;
      if( (checkX <= this.trackMin2) && (checkX >= this.trackMin1) ) {
        //In the min value block
        noMinMax = 0;
        this.trackCurrentValue = this.trackMinValue;
      }
      else if(checkX < this.trackMin1) {
        //Gone too far left
        noMinMax = 0;
        this.trackCurrentValue = this.trackMinValue;
        _knob_setmin(this);
      }
      else if(checkX > (parseInt(this.trackMin1) + parseInt(this.pixelsPerUnit) + ( parseInt((this.trackMaxValue - this.trackMinValue) / this.unitIncrementsValue  ) * parseInt(this.pixelsPerUnit))) ) {
        //Gone too far right
        noMinMax = 0;
        this.trackCurrentValue = this.trackMaxValue;
        _knob_setmax(this);
      }
      else if(checkX > (parseInt(this.trackMin1) + ( parseInt((this.trackMaxValue - this.trackMinValue) / this.unitIncrementsValue  ) * parseInt(this.pixelsPerUnit))) ) {
        //In the max value block
        noMinMax = 0;
        this.trackCurrentValue = this.trackMaxValue;
      }
    } else {
      valueForCalculation = checkY;
      if(checkY > this.trackMin1) {
        //Gone too far Down
        noMinMax = 0;
        this.trackCurrentValue = this.trackMinValue;
        _knob_setmin(this);
      }
      else if(checkY >= this.trackMin2) {
        noMinMax = 0;
        this.trackCurrentValue = this.trackMinValue;
      }
      else if(checkY < this.trackMax2) {
        //Gone to far UP
        noMinMax = 0;
        this.trackCurrentValue = this.trackMaxValue;
        _knob_setmax(this);
      }
      else if(checkY < this.trackMax1) {
        noMinMax = 0;
        this.trackCurrentValue = this.trackMaxValue;
      }
    }
    //if(this.trackValueUpdate && noMinMax) {
    if(noMinMax) {
      //Do live update to HTML element of the current value. This means we must
      //now calculate the value based on increments, pixels per unit and position.
      var unitsV = 0;
      if(this.horizontal) {
        unitsV = parseFloat((parseInt(checkX) - parseInt(this.trackMin2)) / parseInt(this.pixelsPerUnit));
      } else {
        unitsV = parseFloat((parseInt(this.trackMin2) - parseInt(checkY)) / parseInt(this.pixelsPerUnit));
      }
      var units;
      if(units % 1 == 0 ) {
        units = unitsV;
      } else {
        units = parseInt(unitsV) + 1;
      }
      var cvn = new jsnumbers( parseInt(units) * parseFloat(this.unitIncrementsValue) );
      if(this.unitIncrements == 'hundredths') {
        this.trackCurrentValue = parseInt(this.trackMinValue) + parseFloat(cvn.decimal(2));
      }
      else if(this.unitIncrements == 'tenths') {
        this.trackCurrentValue =  parseInt(this.trackMinValue) + parseFloat(cvn.decimal(1));
      } else {
        this.trackCurrentValue = parseInt(this.trackMinValue) + parseFloat(cvn.integer());
      }
    }
    if(this.trackValueUpdate && this.trackValueUpdateType) {
      //integer,decimal x,padding x,paddingLeft x
      var formattedValue = this.trackCurrentValue;
      this.nHandle = new jsnumbers(formattedValue);
      var tvuf = new String(this.trackValueUpdateFormat);
      var tvuf_pairs = new Array();
      if(tvuf.indexOf(';') > 0) {
        tvuf_pairs = tvuf.split(';');
      } else {
        tvuf_pairs.push(tvuf);
      }
      var pairi;
      for(pairi=0;pairi<tvuf_pairs.length;pairi++) {
        if(tvuf_pairs[pairi]) {
          if(tvuf_pairs[pairi] == 'integer') {
            formattedValue = this.nHandle.integer();
            this.nHandle.value(formattedValue);
          }
          else if(tvuf_pairs[pairi].indexOf('decimal') == 0) {
            var decimal_pair = new Array();
            decimal_pair = tvuf_pairs[pairi].split(' ');
            formattedValue = this.nHandle.decimal(decimal_pair[1]);
            this.nHandle.value(formattedValue);
          }
          else if(tvuf_pairs[pairi].indexOf('paddingLeft') == 0) {
            var padding_pair = new Array();
            padding_pair = tvuf_pairs[pairi].split(' ');
            formattedValue = this.nHandle.paddingLeft(padding_pair[1], '0');
            this.nHandle.value(formattedValue);
          }
          else if(tvuf_pairs[pairi].indexOf('padding') == 0) {
            var padding_pair = new Array();
            padding_pair = tvuf_pairs[pairi].split(' ');
            formattedValue = this.nHandle.padding(padding_pair[1]);
            this.nHandle.value(formattedValue);
          }
        }
      }
      if(this.trackValueUpdateType == 'value') {
        document.getElementById(this.trackValueUpdate).value = formattedValue;
      }
      else if(this.trackValueUpdateType == 'innerHTML') {
        document.getElementById(this.trackValueUpdate).innerHTML = formattedValue;
      }
      else if(this.trackValueUpdateType == 'innerText') {
        document.getElementById(this.trackValueUpdate).innerText = formattedValue;
      }
    }
    this.valueNotifyDo();
  }
  this.mouseover = function() {
    //Track-Path
    if(this.trackColorRollover) {
      document.getElementById(this.trackDivId).style.backgroundColor = this.trackColorRollover;
    }
    if(this.pathColorRollover || this.pathStyleRollover) {
      var rbordercolor;
      if(this.pathColorRollover) {
        rbordercolor = this.pathColorRollover;
      } else {
        rbordercolor = this.pathColor;
      }
      var rborderstyle;
      if(this.pathStyleRollover) {
        rborderstyle = this.pathStyleRollover;
      } else {
        rborderstyle = this.pathStyle;
      }
      var rborder = this.pathWidth+'px '+rborderstyle+' '+rbordercolor;
      document.getElementById(this.trackDivId).style.border = rborder;
    }
    //Knob
    if(this.knobBGColorRollover) {
      document.getElementById(this.knobDivId).style.backgroundColor = this.knobBGColorRollover;
    }
    if(this.knobBorderStyleRollover || this.knobBorderColorRollover) {
      var kbordercolor;
      if(this.knobBorderColorRollover) {
        kbordercolor = this.knobBorderColorRollover;
      } else {
        kbordercolor = this.knobBorderColor;
      }
      var kborderstyle;
      if(this.knobBorderStyleRollover) {
        kborderstyle = this.knobBorderStyleRollover;
      } else {
        kborderstyle = this.knobBorderStyle;
      }
      var kborder = this.knobBorderWidth+'px '+kborderstyle+' '+kbordercolor;
      document.getElementById(this.trackDivId).style.border = kborder;
    }
    if(document.getElementById(this.knobTextDivId)) {
      if(this.knobTextRollover) {
        document.getElementById(this.knobTextDivId).innerHTML = this.knobTextRollover;
      }

      if(this.knobFontFamilyRollover) {
        document.getElementById(this.knobTextDivId).fontFamily = this.knobFontFamilyRollover;
      }
      if(this.knobFontColorRollover) {
        document.getElementById(this.knobTextDivId).color = this.knobFontColorRollover;
      }
    }
  }
  this.mouseout = function() {
    //Track-Path
    if(this.trackColorRollover && this.trackColor) {
      document.getElementById(this.trackDivId).style.backgroundColor = this.trackColor;
    }
    if( (this.pathColorRollover && this.pathColor) || (this.pathStyleRollover && this.pathStyle) ) {
      var rborder = this.pathWidth+'px '+this.pathStyle+' '+this.pathColor;
      document.getElementById(this.trackDivId).style.border = rborder;
    }
    //Knob
    if(this.knobBGColorRollover && this.knobBGColor) {
      document.getElementById(this.knobDivId).style.backgroundColor = this.knobBGColor;
    }
    if(this.knobBorderRollover && this.knobBorder) {
      document.getElementById(this.knobDivId).style.border = this.knobBorderWidth+'px '+this.knobBorderStyle+' '+this.knobBorderColour;
    }
    if(document.getElementById(this.knobTextDivId)) {
      if(this.knobTextRollover && this.knobText) {
        document.getElementById(this.knobTextDivId).innerHTML = this.knobText;
      }
      if(this.knobFontFamilyRollover && this.knobFontFamily) {
        document.getElementById(this.knobTextDivId).fontFamily = this.knobFontFamily;
      }
      if(this.knobFontColorRollover && this.knobFontColor) {
        document.getElementById(this.knobTextDivId).color = this.knobFontColor;
      }
    }
  }
  this.value = function() {return this.trackCurrentValue;}
  this.valueReport = function() {
    this.trackValueUpdate = arguments[0];       //ElementID to update with the current value
    this.trackValueUpdateType = arguments[1];   //Should be Value, innerHTML or innerText
    this.trackValueUpdateFormat = arguments[2]; //Format: integer,decimal x,padding x,paddingLeft x
  }
  this.valueSet = function() {
    if( arguments[0]=='min' ) {
      _knob_setmin(this);
      this.autotrack();
    }
    else if( arguments[0]=='max' ) {
      _knob_setmax(this);
      this.autotrack();
    }
    else if(_isNumber(arguments[0])) {
      if( (arguments[0] <= this.trackMinValue) && (arguments[0] >= 1) ) {
        _knob_setmin(this);
        this.autotrack();
      }
      else if( (arguments[0] >= this.trackMaxValue) && (arguments[0] >= 1) ) {
        _knob_setmax(this);
        this.autotrack();
      } else {
        var numValue = parseFloat(arguments[0]);
        if(numValue < 1) {
          if(this.trackMinValue > 0) {
            var setThisValue = parseFloat( ( (this.trackMaxValue - this.trackMinValue) * numValue ) );
            _knob_setvalue(this, setThisValue );
              this.autotrack();
          } else {
            var setThisValue = parseFloat( this.trackMaxValue * numValue );
            _knob_setvalue(this, setThisValue );
            this.autotrack();
          }
        } else {
          _knob_setvalue(this, (arguments[0] - parseFloat(this.trackMinValue)));
          this.autotrack();
        }
      }
    }
  }
  this.valueNotify = function() {
    this.trackNotify = true;
  }
  this.valueNotifyStop = function() {
    this.trackNotify = false;
  }
  this.valueNotifyState = function() {
    return this.trackNotify;
  }
  this.valueNotifyDo = function() {
    if(this.trackNotify == true) {
      JSlider_CaptureChange.notify(this.trackCurrentValue, this.caller, this);
    }
  }
  this.sliderHide = function() {
    document.getElementById(this.trackDivId).style.display='none';
    document.getElementById(this.knobDivId).style.display='none';
  }
  this.sliderUnhide = function() {
    document.getElementById(this.trackDivId).style.display='block';
    document.getElementById(this.knobDivId).style.display='block';
  }
  this.getStyle = function() {
    var elemObj = document.getElementById(arguments[0]);
    var testValue;
    if (elemObj.currentStyle) {
      testValue = elemObj.currentStyle[arguments[1]];
    }
    else if (window.getComputedStyle) {
      testValue = document.defaultView.getComputedStyle(elemObj,null).getPropertyValue(arguments[1]);
    }
    return testValue;
  }
  this.unlock = function() {
    this.locked = false;
  }
  this.lock = function() {
    this.locked = true;
  }
  this.unlocked = function() {
    if(this.locked == true) {
      return false;
    } else {
      return true;
    }
  }
}

function _print_track_knob(oHandle) {
  var trackdivstyle = 'display:block;';
  trackdivstyle += 'position:absolute;';
  trackdivstyle += 'background-color: '+oHandle.trackColor+';';
  trackdivstyle += 'border:'+oHandle.pathWidth+'px '+oHandle.pathStyle+' '+oHandle.pathColor+';';
  if( oHandle.horizontal ) {
    //Track left to right:  width is the length, height is the width
    trackdivstyle += 'width:'+oHandle.trackLength+'px;height:'+oHandle.trackWidth+'px;';
  } else {
    //Track bottom to top: width is the width, height is the length
    trackdivstyle += 'width:'+oHandle.trackWidth+'px;height:'+oHandle.trackLength+'px;';
  }
  if(oHandle.horizontal) {
    if(oHandle.knobFullHeight > oHandle.trackFullHeight) {
      trackdivstyle += 'top:'+parseInt((oHandle.knobFullHeight - oHandle.trackFullHeight) / 2)+'px;';
    } else {
      trackdivstyle += 'top:0px;';
    }
    if( ((parseInt(oHandle.knobWidth) / 2) + parseInt(oHandle.knobBorderWidth)) > parseInt(oHandle.pathWidth) ) {
      trackdivstyle += 'left:'+(((parseInt(oHandle.knobWidth) / 2) + parseInt(oHandle.knobBorderWidth)) - parseInt(oHandle.pathWidth))+'px;';
    } else {
      trackdivstyle += 'left:0px;';
    }
  } else {
    if( ((parseInt(oHandle.knobFullHeight) / 2) + parseInt(oHandle.knobBorderWidth)) > oHandle.pathWidth) {
      trackdivstyle += 'top:'+( ((parseInt(oHandle.knobFullHeight) / 2) + parseInt(oHandle.knobBorderWidth)) - parseInt(oHandle.pathWidth))+'px;';
    } else {
      trackdivstyle += 'top:0px;';
    }
    if( oHandle.knobFullWidth > oHandle.trackFullWidth ) {
      trackdivstyle += 'left:'+parseInt((oHandle.knobFullWidth - oHandle.trackFullWidth) / 2)+'px;';
    } else {
      trackdivstyle += 'left:0px;';
    }
  }
  trackdivstyle += 'padding: 0px;margin: 0px;';

  //    CALCULATE THE KNOB VALUE STARTING POSITIONS
  var knobdivstyle = 'display:block;';
  knobdivstyle += 'position:absolute;';
  knobdivstyle += 'background-color:'+oHandle.knobBGColor+';';
  knobdivstyle += 'border:'+oHandle.knobBorderWidth+'px '+oHandle.knobBorderStyle+' '+oHandle.knobBorderColour+';';
  knobdivstyle += 'width:'+oHandle.knobWidth+'px;height:'+oHandle.knobHeight+'px;';
  knobdivstyle += 'left:0px;';
  if( oHandle.horizontal ) {
    //Track left to right:  width is the length, height is the width
    knobdivstyle += 'top:0px;';
  } else {
    //Track bottom to top: width is the width, height is the length
    knobdivstyle += 'top:'+oHandle.trackLength+'px;';
  }
  knobdivstyle += 'padding: 0px;margin: 0px;';
  document.write('<div id="'+oHandle.trackDivId+'" style="'+trackdivstyle+'"><font style="font-size:'+oHandle.trackWidth+'">&nbsp;</font></div>');

  var divactions;  // mouse events
  divactions = ' onmouseover="if('+oHandle.caller+'.unlocked()){'+oHandle.caller+'.mouseover()}"';
  divactions += ' onmouseout="if('+oHandle.caller+'.unlocked()){'+oHandle.caller+'.mouseout();endMove();}"';
  if(oHandle.horizontal) {
    divactions += ' onmousemove="if('+oHandle.caller+'.unlocked()){moveobjectX(event);'+oHandle.caller+'.autotrack();}"';
  } else {
    divactions += ' onmousemove="if('+oHandle.caller+'.unlocked()){moveobjectY(event);'+oHandle.caller+'.autotrack();}"';
  }
  divactions += ' onmousedown="if('+oHandle.caller+'.unlocked()){startmove(event,this);}"';
  divactions += ' onmouseup="if('+oHandle.caller+'.unlocked()){endMove();}"';

  var textValue = oHandle.knobText;
  if(textValue.length > 0) {
    knobdivstyle += 'text-align:center;line-height:100%;display:table;';
    //var textValue;
    var fontSettings;
    if(oHandle.knobFontFamily) {
      fontSettings += 'font-family:'+oHandle.knobFontFamily+';';
    }
    if(oHandle.knobFontSize) {
      fontSettings += 'font-size:'+oHandle.knobFontSize+'px;';
    }
    if(oHandle.knobFontColor) {
      fontSettings += 'color:'+oHandle.knobFontColor+';';
    }
    textValue = '<div id="'+oHandle.knobTextDivId+'" style="display:table-cell;vertical-align:middle;'+fontSettings+'">'+oHandle.knobText+'</div>';
    document.write('<div id="'+oHandle.knobDivId+'" style="'+knobdivstyle+'"'+divactions+'>'+textValue+'</div>');
  } else {
    document.write('<div id="'+oHandle.knobDivId+'" style="'+knobdivstyle+'"'+divactions+'></div>');
  }
}

function _isNumber(a) {
  return typeof parseFloat(a) == 'number' && isFinite(a);
}

function _knob_setmin(oHandle) {
  //called by obj.valueSet
  if(oHandle.horizontal) {
    document.getElementById(oHandle.knobDivId).style.left = '0px';
  } else {
    document.getElementById(oHandle.knobDivId).style.top = (parseInt(oHandle.trackMin2) + 1) + 'px';;
  }
}

function _knob_setmax(oHandle) {
  //called by obj.valueSet
  if(oHandle.horizontal) {
    document.getElementById(oHandle.knobDivId).style.left = (parseInt(oHandle.trackMax1) + 1) + 'px';
  } else {
    //Vertical
    document.getElementById(oHandle.knobDivId).style.top = '0px';
  }
}

function _knob_setvalue (oHandle, svalue) {
  var setValue = parseFloat(svalue);
  if(setValue == 0) {
    _knob_setmin(oHandle);
  }
  else if(setValue > oHandle.trackMaxValue) {
    _knob_setmin(oHandle);
  }
  else if(setValue > 0) {
    if(oHandle.horizontal) {
      var leftIs = parseInt(oHandle.trackMin1) + (parseInt( setValue / parseFloat(oHandle.unitIncrementsValue)) * parseInt(oHandle.pixelsPerUnit));
      document.getElementById(oHandle.knobDivId).style.left = leftIs.toString()+'px';
    } else {
      //Vertical
      var topIs = parseInt(oHandle.trackMin1) - (parseInt( setValue / parseFloat(oHandle.unitIncrementsValue)) * parseInt(oHandle.pixelsPerUnit));
      document.getElementById(oHandle.knobDivId).style.top = topIs.toString()+'px';
    }
  }
}

function _calculate_dimensions(oHandle) {
  oHandle.knobBorder = oHandle.knobBorderWidth+'px '+oHandle.knobBorderStyle+' '+oHandle.knobBorderColour;
  oHandle.knobBorderRollover = oHandle.knobBorderWidth+'px '+oHandle.knobBorderStyleRollover+' '+oHandle.knobBorderColorRollover;
  var cn = new jsnumbers( parseFloat(parseInt(oHandle.trackMaxValue - oHandle.trackMinValue) / parseFloat(oHandle.unitIncrementsValue)) );
  if(cn.isInt()) {
    oHandle.trackLength = ((parseFloat(parseInt(oHandle.trackMaxValue - oHandle.trackMinValue) / parseFloat(oHandle.unitIncrementsValue)) * oHandle.pixelsPerUnit) + (parseInt(oHandle.pixelsPerUnit) * 2));
    if(oHandle.horizontal) {
      if((parseInt(oHandle.knobWidth / 2) + parseInt(oHandle.knobBorderWidth)) == oHandle.pathWidth) {
        oHandle.trackLeft = 0;
      } else {
        oHandle.trackLeft = (parseInt(oHandle.knobWidth / 2) + parseInt(oHandle.knobBorderWidth)) - parseInt(oHandle.pathWidth);
      }
      if((parseInt(oHandle.knobHeight / 2) + parseInt(oHandle.knobBorderWidth)) == oHandle.pathWidth) {
        oHandle.trackTop = 0;
      } else {
        oHandle.trackTop = (parseInt(oHandle.knobHeight / 2) + parseInt(oHandle.knobBorderWidth)) - parseInt(oHandle.pathWidth);
      }
      oHandle.trackMin1 = 0;
      oHandle.trackMin2 = oHandle.pixelsPerUnit;
      oHandle.trackMax1 = parseInt(parseInt(parseInt(oHandle.trackMaxValue - oHandle.trackMinValue) / parseFloat(oHandle.unitIncrementsValue)) * parseInt(oHandle.pixelsPerUnit));
      oHandle.trackMax2 = parseInt(parseInt(parseInt(oHandle.trackMaxValue - oHandle.trackMinValue) / parseFloat(oHandle.unitIncrementsValue)) * parseInt(oHandle.pixelsPerUnit)) + parseInt(oHandle.pixelsPerUnit);
    } else {
      if((parseInt(oHandle.knobHeight / 2) + parseInt(oHandle.knobBorderWidth)) == oHandle.pathWidth) {
        oHandle.trackTop = 0;
      } else {
        oHandle.trackTop = (parseInt(oHandle.knobHeight / 2) + parseInt(oHandle.knobBorderWidth)) - parseInt(oHandle.pathWidth);
      }
      if((parseInt(oHandle.knobWidth / 2) + parseInt(oHandle.knobBorderWidth)) == oHandle.pathWidth) {
        oHandle.trackLeft = 0;
      } else {
        oHandle.trackLeft = (parseInt(oHandle.knobWidth / 2) + parseInt(oHandle.knobBorderWidth)) - parseInt(oHandle.pathWidth);
      }
      oHandle.trackMin1 = parseInt(parseInt(parseInt(oHandle.trackMaxValue - oHandle.trackMinValue) / parseFloat(oHandle.unitIncrementsValue)) * parseInt(oHandle.pixelsPerUnit)) + parseInt(oHandle.pixelsPerUnit);
      oHandle.trackMin2 = parseInt(parseInt(parseInt(oHandle.trackMaxValue - oHandle.trackMinValue) / parseFloat(oHandle.unitIncrementsValue)) * parseInt(oHandle.pixelsPerUnit));
      oHandle.trackMax1 = oHandle.pixelsPerUnit;
      oHandle.trackMax2 = 0;
    }
    oHandle.knobFullWidth = parseInt(oHandle.knobWidth) + (2*oHandle.knobBorderWidth);
    oHandle.knobFullHeight = parseInt(oHandle.knobHeight) + (2*oHandle.knobBorderWidth);
    if(oHandle.horizontal) {
      oHandle.trackFullWidth = parseInt(oHandle.trackLength) + (2 * oHandle.pathWidth);
      oHandle.trackFullHeight = parseInt(oHandle.trackWidth) + (2 * oHandle.pathWidth);
    } else {
      oHandle.trackFullWidth = parseInt(oHandle.trackWidth) + (2 * oHandle.pathWidth);
      oHandle.trackFullHeight = parseInt(oHandle.trackLength) + (2 * oHandle.pathWidth);
    }
    return true;
  } else {
    window.alert('The increment value does not divide evenly into the sliders value range (Max minus Min). Please modify your parameters.');
    return false;
  }
}

//====================

function jsnumbers (nV) {
  this.numberValue = parseFloat(nV);
  this.cleaned = 0;
  this.integer = function() {
    this.clean();
    return parseInt(this.numberValue);
  }
  this.dollar = function() {
    this.clean();
    return this.decimal(2);
  }
  this.decimal = function () {
    this.clean();
    if(arguments[0]) {
      var nv = new String(this.numberValue);
      if(nv.indexOf('.') >= 0) {
        var nparts = new Array();
        nparts = nv.split('.');
        if(nparts[1].length > arguments[0]) {
          var rounder = nparts[1].charAt(arguments[0]);
          nparts[1] = nparts[1].substr(0, arguments[0]);
          if(rounder >= 5) {
            nparts[1] = parseInt(nparts[1]) + 1;
          }
          var nn = parseInt(this.numberValue);
          return nn.toString()+'.'+nparts[1].toString();
        } else {
          return this.padding(arguments[0]);
        }
      } else {
        return this.integer();
      }
    } else {
      return this.integer();
    }
  }
  this.padding = function() {
    this.clean();
    if(arguments[0]) {
      var nv = new String(this.numberValue);
      if(nv.indexOf('.') >= 0) {
        var nparts = new Array();
        nparts = nv.split('.');
        if(nparts[1].length<arguments[0]) {
          nparts[1] += this.repeat('0', (parseInt(arguments[0]) - nparts[1].length));
        }
        return nparts[0]+'.'+nparts[1];
      } else {
        return nv+'.'+this.repeat('0', arguments[0]);
      }
    }
  }
  this.paddingLeft = function() {
    this.clean();
    var plChar;
    if(!arguments[1]) {
      plChar = ' ';
    } else {
      plChar = arguments[1];
    }
    if(arguments[0]) {
      var nv = new String(this.numberValue);
      if(nv.indexOf('.') >= 0) {
        var nparts = new Array();
        nparts = nv.split('.');
        if(nparts[0].length<arguments[0]) {
          nparts[0] = this.repeat(plChar, (parseInt(arguments[0]) - nparts[0].length)) + nparts[0];
        }
        return nparts[0]+'.'+nparts[1];
      } else {
        return this.repeat(plChar, (parseInt(arguments[0]) - nv.length))+nv;
      }
    }
  }
  this.clean = function() {
    if(!this.cleaned) {
      this.cleaned = 1;
      var ival = this.numberValue;
      var oval = '';
      var oi = 0;
      for(oi=0;oi<ival.length;oi++) {
        if( !isNaN(ival.charAt(oi)) ) {
          oval += ival.substr(oi, 1);
        } else {
          if(ival.charAt(oi)=='.') {
            oval += '.';
          }
        }
      }
      this.numberValue = oval;
    }
  }
  this.value = function() {
    if(arguments[0]) {
      this.numberValue = arguments[0];
      if(this.isNumber(this.numberValue)) {
        this.numberValue = this.numberValue.toString();
      }
      this.cleaned = 0;
      this.clean();
    } else {
      return this.numberValue;
    }
  }
  this.repeat = function() {
    var rc = arguments[0];
    if(!rc) {
      rc = ' ';
    }
    if(arguments[1]) {
      var rv = '';
      var ri = 0;
      for(ri=1;ri<=parseInt(arguments[1]);ri++) {
        rv += rc.toString();
      }
      return rv;
    } else {
      return rc;
    }
  }
  this.isNumber = function() {
    return typeof arguments[0] == 'number' && isFinite(arguments[0]);
  }
  this.isInt = function() {
    var la_mod = parseFloat(this.decimal(2)) % 1;
    if(la_mod == 0) {
      return true;
    } else {
      return false;
    }
  }
  this.Xnth = function() {
    var nth = arguments[0];
    if(!nth) {nth = 1;}
    var nv = new String(this.numberValue);
    if(nv.indexOf('.') >= 0) {
      var nparts = new Array();
      nparts = nv.split('.');
      if(nparts[1].length > nth) {
        var rounder = nparts[1].charAt(nth);
        nparts[1] = nparts[1].substr(0, nth);
        if(rounder >= 5) {
          nparts[1] = parseInt(nparts[1]) + 1;
        }
        return nparts[1].toString();
      } else {
        return nparts[1].toString();
      }
    } else {
      return '0';
    }
  }
  //Called once with object instantiated
  if(this.isNumber(this.numberValue)) {
    this.numberValue = this.numberValue.toString();
  }
}

