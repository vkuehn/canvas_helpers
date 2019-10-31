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
let gauge = [...Array(180).keys()].slice(1);


function draw(){
  bar_pos = 0;
  draw_clean();
  draw_scala_frame();
  gauge.forEach( (rose_value) => draw_items(rose_value));
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
function draw_items(rose_value){
  if (compass.direction - 90 < rose_value && rose_value > compass.direction + 90 ){
    return;
  }
  if( rose_value % 5 === 0) {
    let bt = bar_top_high;
    bar_pos = bar_pos + bars_dist;
    if( rose_value % 10 === 0) {
      ctxCompass.strokeText(rose_value, rectCompass.left + bar_pos - 4, bt - 4);
    } else {
      bt = bar_top_low;
    }
    ctxCompass.beginPath();
    ctxCompass.moveTo(rectCompass.left + bar_pos , bt);
    ctxCompass.lineTo(rectCompass.left + bar_pos , rectCompass.height);
    ctxCompass.stroke();
  }
  if(compass.waypoints.includes(rose_value)){
    draw_waypoint(bar_pos);
  }
  if(compass.direction === rose_value){
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
// leave in here, will be called from outside
function rose_rotate(centr) {
  if(centr < 1 || centr > 360){
    return;
  }
  let arr = compass.rose;
  let arr_1 = [];
  let arr_2 = [];
  let result = [];

  let center = centr ||compass.direction;
  compass.direction = center;

  if(center > 90 && center < 270){
    arr_1 = arr.slice(center - 90,center);
    arr_2 = arr.slice(center,center + 90);
  }
  if(center <= 90){
    arr_1 = arr.slice(0,center);
    arr_2 = arr.slice(center,center + 90);
  }
  if(center >= 270){
    arr_1 = arr.slice(0, 90);
    arr_2 = arr.slice(center - 90,arr.length);
  }
  if(center < 180) {
    result = arr_1.concat(arr_2);
  } else {
    result = arr_2.concat(arr_1);
  }
  gauge = result;
  draw();
}
draw();
