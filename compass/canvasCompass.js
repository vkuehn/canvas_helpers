const canvasCompass = document.getElementById('cnvsCompass');
try {
  let test = canvasCompass.getContext;
}
catch(err){
  let message = document.createElement("error");
  message.innerHTML = "no element found for compass context";
  document.body.appendChild(message);
}
const ctxCompass = canvasCompass.getContext('2d');
const rectCompass = canvasCompass.getBoundingClientRect();
ctxCompass.lineWidth = 1;
ctxCompass.font = 'italic 8px sans-serif';
ctxCompass.strokeStyle = '#000000';
//--------------------------------------------------------------------
let bars_dist = Math.round(rectCompass.width/36);
const bar_top_high = 12;
const bar_top_low = 24;
const wp_shape = { 'width': 20, 'height': 20 };

let bar_pos = 0;
let compass = {
  'direction': 90,
  'rose': [...Array(361).keys()].slice(1),
  'waypoints': [30,70]
};
let gauge = compass_fragment(compass.direction);

function draw(){
  bar_pos = 0;
  gauge = compass_fragment(compass.direction);
  draw_clean();
  draw_scala_frame();
  gauge.forEach( (g_value) => draw_gauge_items(g_value));
  draw_center_bar();
}

function draw_scala_frame() {
  ctxCompass.beginPath();
  ctxCompass.moveTo(rectCompass.left, 0);
  ctxCompass.lineTo(rectCompass.left, rectCompass.height);
  ctxCompass.stroke();
  ctxCompass.beginPath();
  ctxCompass.moveTo(rectCompass.width, 0);
  ctxCompass.lineTo(rectCompass.width, rectCompass.height);
  ctxCompass.stroke();
  ctxCompass.beginPath();
  ctxCompass.lineTo(rectCompass.left, rectCompass.height);
  ctxCompass.lineTo(rectCompass.width, rectCompass.height);
  ctxCompass.stroke();
}

function draw_gauge_items(item_value){
  let bt = bar_top_high;
  if( item_value % 5 === 0) {
    bar_pos = bar_pos + bars_dist;
    if( item_value % 10 === 0) {
      ctxCompass.strokeText(item_value, rectCompass.left + bar_pos - 4, bt - 4);
    } else {
      bt = bar_top_low;
    }
    ctxCompass.beginPath();
    ctxCompass.moveTo(rectCompass.left + bar_pos , bt);
    ctxCompass.lineTo(rectCompass.left + bar_pos , rectCompass.height);
    ctxCompass.stroke();
  }
  if(compass.waypoints.includes(item_value)){
    draw_waypoint(bar_pos);
  }
  if(gauge[90] === item_value){
    draw_center_bar(bar_pos);
  }
}

function draw_center_bar(center_pos){
  center_pos = center_pos + bars_dist - 2; // for some reason we nee that correction
  ctxCompass.beginPath();
  ctxCompass.moveTo(center_pos, bar_top_high);
  ctxCompass.lineTo(center_pos,rectCompass.height);
  ctxCompass.lineWidth = 3;
  ctxCompass.strokeStyle = '#ff0000';
  ctxCompass.stroke();
  ctxCompass.lineWidth = 1;
  ctxCompass.strokeStyle = '#000000'
}

function draw_clean(){
  ctxCompass.clearRect(0, 0, rectCompass.width,rectCompass.height);
}

function draw_waypoint(wp_pos) {
  ctxCompass.beginPath();
  ctxCompass.moveTo(wp_pos,bar_top_high);
  ctxCompass.lineTo(wp_pos + (wp_shape.width / 2 ), bar_top_high + wp_shape.height);
  ctxCompass.lineTo(wp_pos + wp_shape.width, bar_top_high);
  ctxCompass.closePath();
  ctxCompass.fillStyle = "#FFCC00";
  ctxCompass.fill();
  ctxCompass.stroke();
}

function compass_fragment(center) {
  if(center < 0 || center > 360){
    return;
  }
  let _rose = compass.rose;
  
  let _arr_1 = [];
  let _arr_2 = [];
  let _arr_3 = [];
  let _n = 0;
  let result = [];

  if(center > 90 && center < 270){
    _arr_1 = _rose.slice(center - 90,center);
    _arr_2 = _rose.slice(center,center + 90);
    result = _arr_1.concat(_arr_2);
  }
  if(center <= 90){
    _n = 90  - center;
    _arr_1 = _rose.slice(360 - _n,360);
    _arr_2 = _rose.slice(0,center);
    _arr_3 = _rose.slice(center,center + 90);
    result = _arr_1.concat(_arr_2);
    result = result.concat(_arr_3);
  }
  if(center >= 270){
    _n = center - 90;
    _arr_1 = _rose.slice(_n , 360);
    _n = center + 90;
    _n = _n - 360;
    _arr_2 = _rose.slice(0,_n);
    result = _arr_1.concat(_arr_2);
  }
  return result;
}

draw();
