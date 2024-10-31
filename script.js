var g = 9.81;
const DELTA_T = 0.01;
var MAX_X_DOMAIN = 10;

var color_gradient_start = -40;
var color_gradient_increment = 10;
var color_gradient_epsilon = 1;
  
var border = null;
var func_str = '';
var forceType = false;
var own_func = null
objects = []

var colors = [
  "rgba(255, 0, 0, 1)", "rgba(255, 154, 0, 1)", "rgba(208, 222, 33, 1)", "rgba(79, 220, 74, 1)", 
  "rgba(63, 218, 216, 1)", "rgba(47, 201, 226, 1)", "rgba(28, 127, 238, 1)", "rgba(95, 21, 242, 1)", 
  "rgba(186, 12, 248, 1)",
]


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

function digitnumber(number) {
  let a = 0;
  if (number == 0) {
    return 0;
  }
  number = Math.abs(number);
  if (number > 1) {
    while (number > 10) {
      number /= 10;
      a++;
    }
    return a;
  }
  while (number < 1) {
    number *= 10;
    a--;
  }
  return a;
}

function to_scientific_notation(number) {
  exponent = digitnumber(number);
  if (exponent != 0 && exponent != 1) {
    number = number * Math.pow(10, -exponent);
  }

  let string = round(number, 3);
  if (exponent != 0 && exponent != 1) {
    string += ' x 10^(' + exponent + ')';
  }
  return string;
}

var x_0 = 0;
var y_0 = 0;
var elasticity_c = 1;

const GConst = 6.67 * Math.pow(10, -11);
var mass = 5.9722 * Math.pow(10, 24);

const EPSILON = 0.01;

function gravitationalEnergy(x, y) {
  let r2 = Math.pow(x - x_0, 2) + Math.pow(y - y_0, 2);

  return mass * GConst / r2;
}

function fallingEnergy(x, y) {
  return g * (y - y_0);
}

function elasticityEnergy(x, y) {
  return elasticity_c * (Math.pow(x - x_0, 2) + Math.pow(y - y_0, 2)) / 2;
}

var func = elasticityEnergy;

function innerSizes(node) {
  var computedStyle = getComputedStyle(node);

  let width = node.clientWidth;
  let height = node.clientHeight;
  
  width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
  height -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
  return [width, height];
}

class Border {
  constructor(id){
    this.id = id;
    this.DOMObject = document.getElementById(this.id);

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

function createHiPPICanvas(canvas, width, height) {
  const ratio = window.devicePixelRatio;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = (width) + "px";
  canvas.style.height = (height - 6) + "px";
  canvas.getContext("2d").scale(ratio, ratio);

  return canvas;
}
  
var energies = {};
var dx;
var dy;

function integrate(x, y) {
  if ([x, y] in energies) {
    return energies[[x, y]];
  }

  if (x_0 - dx <= x && x <= x_0 + dx) {
    if (y_0 - dy <= y && y <= y_0 + dy) {
      return 0;
    }
    if (y_0 < y) {
      energies[[x, y]] = integrate(x_0, y - dy) - own_func(x, y)[1] * dy;
      return energies[[x, y]];
    } else {
      energies[[x, y]] = integrate(x_0, y + dy) - own_func(x, y)[1] * dy;
      return energies[[x, y]];
    }
  }
  if (x_0 < x) {
    energies[[x, y]] = integrate(x - dx, y) - own_func(x, y)[0] * dx;
    return energies[[x, y]];
  } else {
    energies[[x, y]] = integrate(x + dx, y) - own_func(x, y)[0] * dx;
    return energies[[x, y]];
  }
}

function recalculate() {
    if (forceType != 'inputForce') {
      redraw();
      return;
    }
    energies = {};

    for (let x = border.x_domain_start; x < border.x_domain; x += dx) {
      for (let y = border.y_domain_start; y < border.y_domain; y += dy) {      
        integrate(x, y)
      }
    }
    redraw();
}

function redraw() {
  let chartObject = document.getElementById('mainchart');
  createHiPPICanvas(chartObject, border.width, border.height);

  let chartContext = chartObject.getContext('2d');
  chartContext.clearRect(0, 0, chartObject.width, chartObject.height);

  
  chartContext.fillStyle = 'black';
  let i_0 = (x_0 - border.x_domain_start) / (border.x_domain - border.x_domain_start) * border.width;
  let j_0 = border.height - (y_0 - border.y_domain_start) / (border.y_domain - border.y_domain_start) * border.height;
  let radius = 5;

  chartContext.beginPath();
  chartContext.arc(i_0, j_0, radius, 0, 2 * Math.PI);
  chartContext.fill();

  for (let x = border.x_domain_start; x < border.x_domain; x += dx) {
    let i = (x - border.x_domain_start) / (border.x_domain - border.x_domain_start) * border.width;
    for (let y = border.y_domain_start; y < border.y_domain; y += dy) {      
      let j = border.height - (y - border.y_domain_start) / (border.y_domain - border.y_domain_start) * border.height;

      
      let energy = func(x, y);
      
      for (let k = 0; k < colors.length; k++) {
        let color_energy = color_gradient_start + color_gradient_increment * k;
        if (energy < color_energy - color_gradient_epsilon) {
          break;
        } else if (energy <= color_energy + color_gradient_epsilon) {
          chartContext.fillStyle = colors[k];
          chartContext.fillRect(i, j, 1, 1);
          break;
        }
      }
    }
  }
}


function reloadModel() {
    objects = [];
    border = new Border('border');
    dx = (border.x_domain - border.x_domain_start) / border.width;
    dy = (border.y_domain - border.y_domain_start) / border.height;

    recalculate();
}

function collectData() {
  let x_0_ = parseFloat(document.getElementById('x_0').value);
  let y_0_ = parseFloat(document.getElementById('y_0').value);
  mass_mantissa = parseFloat(document.getElementById('mass').value);
  mass_exponent = parseFloat(document.getElementById('mass_exponent').value);
  let mass_ = mass_mantissa * Math.pow(10, mass_exponent);
  let MAX_X_DOMAIN_ = parseFloat(document.getElementById('x_domain').value) / 2;
  if (MAX_X_DOMAIN_ < 0) {
    window.alert('Ширина области не может быть неположительной');
    return;
  }
  let elasticity_c_ = parseFloat(document.getElementById('elasticity_c').value);
  let g_ = parseFloat(document.getElementById('g').value);

  let x_func = document.getElementById('f_x_function').value;
  let y_func = document.getElementById('f_y_function').value;

  let func2 = "(x, y) => [" + x_func + ", " + y_func + "]";

  let fType = document.querySelector('input[name="forceType"]:checked').value;

  return [x_0_, y_0_, mass_, MAX_X_DOMAIN_, elasticity_c_, g_, func2, fType];
}


function reloadForm() {
  let data = collectData();
  if (data == null) {
    return;
  }
  let old_data = [x_0, y_0, mass, MAX_X_DOMAIN, elasticity_c, g, func_str, forceType];
  let are_equal = old_data.length === data.length && old_data.every(function(value, index) { return value === data[index]});
  if (are_equal){
    document.getElementById('curtain').style.visibility = 'visible';
    redraw();
    document.getElementById('curtain').style.visibility = 'hidden';
    return;
  }
  [x_0, y_0, mass, MAX_X_DOMAIN, elasticity_c, g, func_str, forceType] = data;

  if (forceType == 'inputForce'){
    let func2;
    
    try {
      func2 = eval(func_str)
    } catch (error) {
      console.log(error);
      window.alert('Функция задана неправильно!');
      return;
    }
    own_func = func2;
    func = integrate;
  } else if (forceType == 'gravitationalForce') {
    func = gravitationalEnergy;
  } else if (forceType == 'elasticityForce') {
    func = elasticityEnergy;
  } else if (forceType == 'fallingForce') {
    func = fallingEnergy;
  }

  document.getElementById('curtain').style.visibility = 'visible';
  reloadModel();
  document.getElementById('curtain').style.visibility = 'hidden';
}


function showEnergyValue(event) {
  let shower = document.getElementById('energyshower');
  shower.style.display = 'inline';

  let x = event.offsetX / border.width * (border.x_domain - border.x_domain_start) + border.x_domain_start;
  let y = (border.height - event.offsetY) / border.height * (border.y_domain - border.y_domain_start) + border.y_domain_start;

  shower.innerHTML = "(" + to_scientific_notation(x) + ' м, ' + to_scientific_notation(y) + " м)<br/>" + 
    to_scientific_notation(func(x, y)) + ' Дж';

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

function updateColorGradient(event) {
  color_gradient_start = parseFloat(document.getElementById('colorsq1value').value);
  color_gradient_epsilon = parseFloat(document.getElementById('color_gradient_epsilon').value);
  color_gradient_increment = parseFloat(document.getElementById('color_gradient_increment').value);

  for (let i = 1; i <= colors.length; i++) {
    document.getElementById('colorsq' + i + 'value').innerHTML = to_scientific_notation(color_gradient_start + color_gradient_increment * (i - 1)) + ' ± ' + to_scientific_notation(color_gradient_epsilon);
  }
}

function updateForceType(event) {
  let fType = document.querySelector('input[name="forceType"]:checked').value;
  document.getElementById('gravitationalForceForm').style.display = 'none';
  document.getElementById('inputForceForm').style.display = 'none';
  document.getElementById('fallingForceForm').style.display = 'none';
  document.getElementById('elasticityForceForm').style.display = 'none';

  document.getElementById(fType + 'Form').style.display = 'block';

}


window.onload = () => {
  let canvas = document.getElementById('mainchart');
  canvas.addEventListener("mousemove", showEnergyValue);
  canvas.addEventListener("mouseleave", removeEnergyValue);

  document.getElementById('colorsq1value').addEventListener('change', updateColorGradient);
  document.getElementById('color_gradient_epsilon').addEventListener('change', updateColorGradient);
  document.getElementById('color_gradient_increment').addEventListener('change', updateColorGradient);
  updateColorGradient(1);

  document.getElementById('gravitationalRadio').addEventListener('change', updateForceType);
  document.getElementById('inputRadio').addEventListener('change', updateForceType);
  document.getElementById('elasticityRadio').addEventListener('change', updateForceType);
  document.getElementById('fallingRadio').addEventListener('change', updateForceType);
  updateForceType(1);

  reloadForm();

  document.getElementById('collisionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    reloadForm();
  });

}
