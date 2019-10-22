const canvasJoy = document.getElementById("cnvsJoy");
const ctxJoy = canvasJoy.getContext("2d");
const rectJoy = canvasJoy.getBoundingClientRect();

let controllers = {};
let mdown = false;

let haveEvents = 'GamepadEvent' in window;
let factor_x = rangeToFactor(rectJoy.width);
let factor_y = rangeToFactor(rectJoy.height);
let posJoy = setCenter(rectJoy);
let vel = setVelStart();

canvasJoy.addEventListener("mousedown", inputStart, false);
canvasJoy.addEventListener("mouseup", inputEnd, false);
canvasJoy.addEventListener("mouseout", function() { mdown = false; }, false);
canvasJoy.addEventListener('mousemove', inputMove, false);
canvasJoy.addEventListener("touchstart", inputStart, false);
canvasJoy.addEventListener("touchend", inputEnd, false);
canvasJoy.addEventListener("touchmove", inputMove, false);

/* first run time set defaults also */
ctxJoy.lineWidth = 1;
inputEnd();

function inputStart() {
  mdown = true;
}

function inputEnd() {
  posJoy.cx = 0
  posJoy.cy = 0
  moveCenter();
  mdown = false;
  vel.linearX = 0.0;
  vel.linearY = 0.0;
  drawJoyField();
  sendPos();
}

function inputMove(e) {
  if(mdown) {
    getMousePos(e);
    getVel();
    sendPos();
    drawJoyHandle();
  }
}

function getMousePos(evt) {
  posJoy.cx =  Math.round(evt.clientX - rectJoy.left);
  posJoy.cy = Math.round(evt.clientY - rectJoy.top);
}

function getVel() {
  if (posJoy.cx < rectJoy.width / 2){
    vel.linearX = Math.round(rectJoy.width / 2 - posJoy.cx);
    vel.linearX = 0 - vel.linearX;
  }else {
    vel.linearX = Math.round(posJoy.cx - rectJoy.width / 2);
  }
  if (posJoy.cy < rectJoy.height / 2){
    vel.linearY = Math.round(posJoy.cy - rectJoy.height / 2);
    vel.linearY = 0 - vel.linearY;
  }else {
    vel.linearY = Math.round(rectJoy.height / 2 -posJoy.cy);
  }
  if (vel.linearX > rectJoy.width){ vel.linearX = rectJoy.width / 2}
  if (vel.linearY > rectJoy.height){ vel.linearY = rectJoy.height / 2}
  vel.linearX = vel.linearX * factor_x
  vel.linearY = vel.linearY * factor_y
}

/**
  * we always want to be between 0 and 100.
  * there we return a factor to calculate a number within the range 0 - 100
  * examples
  * 50 -> 2
  * 100 -> 1
  * 200 -> 0.5
  * 1 -> 100
  */
 function rangeToFactor(max_value){
  if(max_value > 1){
      let factor = 0;
      factor = 100 / max_value;
      return factor;
  }
  return 100;

}

function setCenter(rectJoy){
  var center = {
    cx: Math.round(rectJoy.right/2),
    cy: Math.round(rectJoy.bottom/2)
  }
  return center;
}

function setVelStart(){
  var vel = {
      linearX: posJoy.cx,
      linearY: posJoy.cy,
      linearZ: 0.0,
      angularX: 0.0,
      angularY: 0.0,
      angularZ: 0.0
  };
  return vel;
}

function moveCenter(){
  inputMove({ clientX: posJoy.cx, clientY: posJoy.cy});
}

function sendPos() {
  // here we would call an api or anything which should know the result
  console.log("v x:" + vel.linearX + ",v Y:" + vel.linearY);
}

function drawJoyHandle() {
  ctxJoy.clearRect(0, 0, rectJoy.width, rectJoy.height);
  drawJoyField();
}

function drawJoyField() {
  ctxJoy.beginPath();
  ctxJoy.arc(rectJoy.width/2,rectJoy.height/2,25,0,2*Math.PI);
  ctxJoy.stroke();
  ctxJoy.beginPath();
  ctxJoy.arc(rectJoy.width/2,rectJoy.height/2,40,0,2*Math.PI);
  ctxJoy.stroke();
  if(mdown === false){
    ctxJoy.beginPath();
    ctxJoy.arc(rectJoy.width/2,rectJoy.height/2,10,0,2*Math.PI);
    ctxJoy.globalAlpha=0.5;disconnecthandler
    ctxJoy.fillStyle = 'orange';
    ctxJoy.fill();
    ctxJoy.stroke();
  }else{
    ctxJoy.beginPath();
    ctxJoy.arc(posJoy.cx, posJoy.cy, 10, 0, 2 * Math.PI, false);
    ctxJoy.globalAlpha=1.0;
    ctxJoy.fillStyle = 'orange';
    ctxJoy.fill();
    ctxJoy.stroke();
  }
}

// -- game pad---------------------------------------------------------
var fps = 20 // we use requestAnimationFrame in updateStatus

if (haveEvents) {
  window.addEventListener("gamepadconnected", connecthandler);
  window.addEventListener("gamepaddisconnected", disconnecthandler);
}

// -- handlers
function connecthandler(e) {
  if(e.gamepad.id.includes('PLAYSTATION(R)3')){
    console.log("A gamepad connected:");
    console.log(e.gamepad);
    ps3_connected();
    addgamepad(e.gamepad);
  } else {
    console.log('unknow gamepad connected')
  }
  
}
function disconnecthandler(e) {
  if(e.gamepad.id.includes('PLAYSTATION(R)3')){
    console.log("A gamepad disconnected:");
    console.log(e.gamepad);
    removegamepad(e.gamepad);
  }
}

// --
function addgamepad(gamepad) {
    controllers[gamepad.index] = gamepad;
    requestAnimationFrame(updateStatus);
}

function removegamepad(gamepad) {
  delete controllers[gamepad.index];
}

function updateStatus() {
  scangamepads();
  for (j in controllers) {
    var controller = controllers[j];
    for (var i=0; i<controller.buttons.length; i++) {
      var val = controller.buttons[i];
      var pressed = val == 1.0;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        val = val.value;
      }
      if (pressed) {
        console.log("button" + [i] + " pressed " + val);
      }
    }
    for (var i=0; i<controller.axes.length; i++) {
      if (controller.axes[i] != 0.0) {
        if(i === ps3_axis_id_x){
          ps3_axis_pos_x = controller.axes[i].toFixed(2);
          ps3_axis_pos_x = Math.round(ps3_axis_pos_x * ps3_factor_x);
          vel.linearX = ps3_axis_pos_x;
          if (vel.linearX > rectJoy.width){ vel.linearX = rectJoy.width / 2}
          posJoy.cx =  Math.round(ps3_axis_pos_x - rectJoy.left);
          sendPos();
          mdown = true;
          drawJoyHandle();
        }
        if(i === ps3_axis_id_y){
          ps3_axis_pos_y = controller.axes[i].toFixed(2);
          ps3_axis_pos_y = ~Math.round(ps3_axis_pos_y * ps3_factor_y);
          vel.linearY = ps3_axis_pos_y;
          if (vel.linearY > rectJoy.height){ vel.linearY = rectJoy.height / 2}
          posJoy.cy = Math.round(ps3_axis_pos_y - rectJoy.top);
          sendPos();
          mdown = true;
          drawJoyHandle();
        }
      }
    }
  }
  setTimeout(function(){ requestAnimationFrame(updateStatus); }, 1000/fps)
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (!(gamepads[i].index in controllers)) {
        addgamepad(gamepads[i]);
      } else {
        controllers[gamepads[i].index] = gamepads[i];
      }
    }
  }
}

// -- ps3 -------------------------------------------------------------------------------------
ps3_factor_x = rangeToFactor(1) / 2;
ps3_factor_y = rangeToFactor(1) / 2;
ps3_axis_id_x = 3;
ps3_axis_id_y = 4;
ps3_axis_pos_x = 0;
ps3_axis_pos_y = 0;

function ps3_connected(){
  inputEnd();
}

function ps_disconnect(){
  inputEnd();
}