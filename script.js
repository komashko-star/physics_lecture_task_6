var colors = ['silver', 'gray', 'white', 'maroon', 'red',
  'purple', 'fuchsia', 'green', 'lime', 'olive',
  'yellow', 'navy', 'blue', 'teal', 'aqua']

var G = 9.81;
const DELTA_T = 0.01;
var MAX_X_DOMAIN = 10;
  
var border = null;
objects = []

function round(number, a) {
  if (a > 0) {
    return number.toFixed(a);
  } else if (a == 0) {
    return Math.round(number);
  } else {
    let r = number % Math.pow(10, -a);

    if (r / Math.pow(10, -a) > 0.5) {
      return number - number % Math.pow(10, -a);
    } else {
      return number - number % Math.pow(10, -a) + 1;
    }

  }
}

var x_0 = 0;
var y_0 = 0;
var elasticity_c = 1;

const GConst = 6.67 * Math.pow(10, -11);
var mass = 5.9722 * Math.pow(10, 24);

const EPSILON = 0.05;

function gravitationalForce(x, y) {
  let r2 = Math.pow(x - x_0, 2) + Math.pow(y - y_0, 2);

  return mass * GConst / r2;
}

function fallingForce(x, y) {
  return G * (y - y_0);
}

function elasticityForce(x, y) {
  return elasticity_c * (Math.pow(x - x_0, 2) + Math.pow(y - y_0, 2)) / 2;
}

var func = elasticityForce;

function innerSizes(node) {
  var computedStyle = getComputedStyle(node);

  let width = node.clientWidth;
  let height = node.clientHeight;
  
  width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
  height -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
  return [width, height];
}

class Border {
  constructor(id, coefficient){
    this.id = id;
    this.DOMObject = document.getElementById(this.id);

    this.coefficient = coefficient;
    this.x_domain_start = -MAX_X_DOMAIN;
    this.x_domain = MAX_X_DOMAIN;
    this.width = innerSizes(this.DOMObject)[0];
    this.height = innerSizes(this.DOMObject)[1];
    this.y_domain_start = -this.height / this.width * MAX_X_DOMAIN;
    this.y_domain = this.height / this.width * MAX_X_DOMAIN;
  }
  getDOMObject(){
    this.DOMObject = document.getElementById(this.id);
    return this.DOMObject;
  }
}


is_moving = false;
next_step = false;
counter = 1;

setInterval(() => {
  if (is_moving || next_step) {
    objects.forEach(element => {
      element.move();
    });
    next_step = false;
  }

  return;
}, DELTA_T * 1000)

colors = {
  100: "rgba(255, 0, 0, 1)",
  200: "rgba(255, 154, 0, 1)",
  300: "rgba(208, 222, 33, 1)",
  400: "rgba(79, 220, 74, 1)",
  500: "rgba(63, 218, 216, 1)",
  600: "rgba(47, 201, 226, 1)",
  700: "rgba(28, 127, 238, 1)",
  800: "rgba(95, 21, 242, 1)",
  900: "rgba(186, 12, 248, 1)",
  1000: "rgba(251, 7, 217, 1)",
}

function createHiPPICanvas(canvas, width, height) {
  const ratio = window.devicePixelRatio;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = (width) + "px";
  canvas.style.height = (height - 6) + "px";
  canvas.getContext("2d").scale(ratio, ratio);

  return canvas;
}
  
function makeCharts() {
    let chartObject = document.getElementById('mainchart');
    createHiPPICanvas(chartObject, border.width, border.height);

    let chartContext = chartObject.getContext('2d');
    chartContext.clearRect(0, 0, chartObject.width, chartObject.height);
    
    let [pixel_width, pixel_height] = [border.width, border.height];

    chartContext.fillStyle = 'black';
    let i_0 = (x_0 - border.x_domain_start) / (border.x_domain - border.x_domain_start) * pixel_width;
    let j_0 = pixel_height - (y_0 - border.y_domain_start) / (border.y_domain - border.y_domain_start) * pixel_height;
    let radius = 10;

    chartContext.beginPath();
    chartContext.arc(i_0, j_0, radius, 0, 2 * Math.PI);
    chartContext.fill();

    let energies = [];
    for (let i = 0; i < pixel_width; i++) {
      let x = i / pixel_width * (border.x_domain - border.x_domain_start) + border.x_domain_start;
      for (let j = 0; j < pixel_height; j++) {
        let y = (pixel_height - j) / pixel_height * (border.y_domain - border.y_domain_start) + border.y_domain_start;
        
        let energy = round(func(x, y), -1);
        if (!(energy in energies)) {
          energies.push(energy);
        }

        if (energy in colors) {
          chartContext.fillStyle = colors[energy];
          chartContext.fillRect(i, j, 1, 1);
        }
      }
    }
}


function reloadModel() {
    objects = [];
    border = new Border('border');

    makeCharts();
}


function reloadForm() {
  mass_mantissa = parseFloat(document.getElementById('mass').value);
  mass_exponent = parseFloat(document.getElementById('mass_exponent').value);
  mass = mass_mantissa * Math.pow(10, mass_exponent);
  MAX_X_DOMAIN = parseFloat(document.getElementById('x_domain').value) / 2;
  elasticity_c = parseFloat(document.getElementById('elasticity_c').value);


  reloadModel();
}


function showEnergyValue(event) {
  let shower = document.getElementById('energyshower');
  shower.style.display = 'inline';

  let x = event.offsetX / border.width * (border.x_domain - border.x_domain_start) + border.x_domain_start;
  let y = (border.height - event.offsetY) / border.height * (border.y_domain - border.y_domain_start) + border.y_domain_start;
  shower.innerHTML = func(x, y) + " Дж";

  let shower_width = getComputedStyle(shower).width;
  shower_width = +(shower_width.slice(0, shower_width.length - 2));

  shower.style.top = event.offsetY + 'px';
  if (shower_width + event.offsetX + 10 > border.width) {
    shower.style.left = event.offsetX - shower_width - 10 + 'px';
  } else {
    shower.style.left = event.offsetX + 10 + 'px';
  }
}

function removeEnergyValue(event) {
  let shower = document.getElementById('energyshower');
  shower.style.display = 'none';
}


window.onload = () => {
  let canvas = document.getElementById('mainchart');
  canvas.addEventListener("mousemove", showEnergyValue);
  canvas.addEventListener("mouseleave", removeEnergyValue);


  reloadForm();

  document.getElementById('collisionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    reloadForm();
  });

}
