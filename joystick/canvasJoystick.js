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

//ps3
let ps3_controller_connected = false;
let ps3_factor_x = rangeToFactor(1) / 2;
let ps3_factor_y = rangeToFactor(1) / 2;
let ps3_axis_id_x = 3;
let ps3_axis_id_y = 4;
let ps3_axis_pos_x = 0;
let ps3_axis_pos_y = 0;
//

canvasJoy.addEventListener("mousedown", inputStart, false);
canvasJoy.addEventListener('mousemove', inputMove, false);
canvasJoy.addEventListener("mouseout", inputEnd, false);
canvasJoy.addEventListener("mouseup", inputEnd, false);
canvasJoy.addEventListener("touchstart", inputStart, false);
canvasJoy.addEventListener("touchend", inputEnd, false);
canvasJoy.addEventListener("touchmove", inputMove, false);

/* first run time set defaults also */
ctxJoy.lineWidth = 1;
inputEnd();

function goodPos() {
    /* bad if joyPos is in las 10% in rectJoy */
    if(posJoy.cx > rectJoy.width / 10 * 9){return false;}
    if(posJoy.cy > rectJoy.width / 10 * 9){return false;}
    if(posJoy.cx < 10){return false;}
    if(posJoy.cy < 10){return false;}
    return true;
}

function finaliseMove() {
    drawJoyField();
    sendPos();
}

function inputStart() {
  mdown = true;
}

function inputEnd() {
  posJoy = setCenter(rectJoy);
  inputMove({ clientX: posJoy.cx, clientY: posJoy.cy});
  mdown = false;
  vel.linearX = 0.0;
  vel.linearY = 0.0;
  finaliseMove();
}

function inputMove(e) {
  if(mdown) {
    if(!goodPos()) { inputEnd(); }
    getMousePos(e);
    getVel();
    sendPos();
    drawJoyField();
  }
  finaliseMove();
}

function getMousePos(evt) {
  posJoy.cx =  Math.round(evt.clientX - rectJoy.left);
  posJoy.cy = Math.round(evt.clientY - rectJoy.top);
  // console.log('j cx:' + posJoy.cx + "j cy:" + posJoy.cy)
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
  vel.linearX = vel.linearX * factor_x;
  vel.linearY = vel.linearY * factor_y;
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
  let factor = 100;
  if(max_value > 1){
      factor = factor / max_value;
  }
  return factor;
}

function setCenter(rectJoy){
  let new_center = {
    cx: Math.round(rectJoy.height/2),
    cy: Math.round(rectJoy.width/2)
  };
  return new_center;
}

function setVelStart(){
  let vel_start = {
      linearX: posJoy.cx,
      linearY: posJoy.cy,
      linearZ: 0.0,
      angularX: 0.0,
      angularY: 0.0,
      angularZ: 0.0
  };
  return vel_start;
}

function sendPos() {
  // here we would call an api or anything which should know the result
  //console.log('ps3 x:' + ps3_axis_pos_x + ' ps3 y:' + ps3_axis_pos_y);
  //onsole.log('j cx:' + posJoy.cx + "j cy:" + posJoy.cy)
  console.log("v x:" + vel.linearX + ",v Y:" + vel.linearY);
}

function drawJoyField() {
  ctxJoy.clearRect(0, 0, rectJoy.width, rectJoy.height);
  ctxJoy.beginPath();
  ctxJoy.arc(rectJoy.width/2,rectJoy.height/2,25,0,2*Math.PI);
  ctxJoy.stroke();
  ctxJoy.beginPath();
  ctxJoy.arc(rectJoy.width/2,rectJoy.height/2,40,0,2*Math.PI);
  ctxJoy.stroke();
  if(mdown === false){
    ctxJoy.beginPath();
    ctxJoy.arc(rectJoy.width/2,rectJoy.height/2,10,0,2*Math.PI);
    ctxJoy.globalAlpha=0.5;
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

// -- ps3 -------------------------------------------------------------------------------------
function ps3_connected(){
  inputEnd();
  mdown = true;
}

function ps3_disconnect(){
  inputEnd();
  mdown = false;
}
// -- game pad---------------------------------------------------------
let fps = 20 // we use requestAnimationFrame in updateStatus
let draw_interval = '';

let center = setCenter(rectJoy);

if (haveEvents) {
  window.addEventListener("gamepadconnected", connectHandler);
  window.addEventListener("gamepaddisconnected", disconnectHandler);
}

// -- handlers
function connectHandler(e) {
  if(e.gamepad.id.includes('PLAYSTATION(R)3')){
    console.log("A gamepad connected:");
    console.log(e.gamepad);
    ps3_connected();
    addGamepad(e.gamepad);
  } else {
    console.log('unknow gamepad connected')
  }
}
function disconnectHandler(e) {
  if(e.gamepad.id.includes('PLAYSTATION(R)3')){
    console.log("A gamepad disconnected:");
    console.log(e.gamepad);
    clearInterval(draw_interval);
    ps3_disconnect();
    removeGamepad(e.gamepad);
  }
}
function addGamepad(gamepad) {
    controllers[gamepad.index] = gamepad;
    ps3_controller_connected = true;
    requestAnimationFrame(updateStatus);
}
function removeGamepad(gamepad) {
  ps3_controller_connected = false;
  delete controllers[gamepad.index];
}

function updateStatus() {
  scanGamepads();
  for (j in controllers) {
    let controller = controllers[j];
    for (let i=0; i<controller.buttons.length; i++) {
      let val = controller.buttons[i];
      let pressed = val == 1.0;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        val = val.value;
      }
      if (pressed) {
        console.log("button" + [i] + " pressed " + val);
      }
    }
    for (let i=0; i<controller.axes.length; i++) {
      if (controller.axes[i] != 0.0) {
        if(i === ps3_axis_id_x){
          ps3_axis_pos_x = controller.axes[i].toFixed(2);
          ps3_axis_pos_x = Math.round(ps3_axis_pos_x * ps3_factor_x);
          if (ps3_factor_x > rectJoy.width){ ps3_axis_pos_x = rectJoy.width / 2}

        }
        if(i === ps3_axis_id_y){
          ps3_axis_pos_y = controller.axes[i].toFixed(2);
          ps3_axis_pos_y = Math.round(ps3_axis_pos_y * ps3_factor_y);
          if (ps3_axis_pos_y > rectJoy.height){ ps3_axis_pos_y = rectJoy.height / 2}
          posJoy.cy = ps3_factor_y;
        }
      }
    }
  }
  if(ps3_controller_connected === true){
    posJoy.cx = center.cx + ps3_axis_pos_x;
    posJoy.cy = center.cy + ps3_axis_pos_y;
    getVel();
    sendPos();
    requestAnimationFrame(drawJoyField);
    requestAnimationFrame(updateStatus);
  }
}

function scanGamepads() {
  let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (!(gamepads[i].index in controllers)) {
        addGamepad(gamepads[i]);
      } else {
        controllers[gamepads[i].index] = gamepads[i];
      }
    }
  }
}
