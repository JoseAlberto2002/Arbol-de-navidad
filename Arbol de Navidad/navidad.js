
  var thetamin = 0,
  thetamax = 6 * Math.PI,
  period = 5,
  linespacing = 1 / 30,
  linelength = linespacing / 2,
  yscreenoffset = 300,
  xscreenoffset = 260,
  xscreenscale = 360,
  yscreenscale = 360,
  ycamera = 2,
  zcamera = -3,

  rate = 1 / (2 * Math.PI), // Cada rotación y se hace una más grande
  factor = rate / 3;

function run() {
  var ctx = document.getElementById('scene').getContext('2d'),
      spirals = [
        new Spiral({
          foreground: "#220000", //segunda sombra para espiral roja
          angleoffset: Math.PI * 0.92,
          factor: 0.90 * factor
        }),
        new Spiral({
          foreground: "#002211", // Segunda sombra para espiral cian
          angleoffset: -Math.PI * 0.08,
          factor: 0.90 * factor
        }),
        new Spiral({
          foreground: "#660000", // sombra roja
          angleoffset: Math.PI * 0.95,
          factor: 0.93 * factor
        }),
        new Spiral({
          foreground: "#003322", //sombra cian
          angleoffset: -Math.PI * 0.05,
          factor: 0.93 * factor
        }),
        new Spiral({
          foreground: "#ff0000", //espira roja
          angleoffset: Math.PI,
          factor: factor
        }),
        new Spiral({
          foreground: "#00ffcc", //espira cyan
          factor: factor
        })];

  renderFrame(); //el bucle de animación comienza aquí

  function renderFrame() {
    requestAnimationFrame(renderFrame);

    ctx.clearRect(0, 0, 500, 500);
    ctx.beginPath();
    spirals.forEach(renderSpiral);
  }

  function renderSpiral(spiral) {
    spiral.render(ctx);
  }

  function Spiral(config) {
    var offset = 0;
    var lineSegments = computeLineSegments();

    this.render = function(ctx) {
      offset -= 1;
      if (offset <= -period) {
        offset += period;
      }

      lineSegments[offset].forEach(drawLineSegment);
    };

    function drawLineSegment(segment) {
      stroke(config.foreground, segment.start.alpha);
      ctx.moveTo(segment.start.x, segment.start.y);
      ctx.lineTo(segment.end.x, segment.end.y);
    }

    function computeLineSegments() {
      var lineSegments = {};
      var factor = config.factor;
      var thetanew, thetaold;
      for (var offset = 0; offset > -period; offset--) {
        lineSegments[offset] = lines = [];
        for (var theta = thetamin + getdtheta(thetamin, offset * linespacing / period, rate, factor); theta < thetamax; theta += getdtheta(theta, linespacing, rate, factor)) {
          thetaold = (theta >= thetamin) ? theta : thetamin;
          thetanew = theta + getdtheta(theta, linelength, rate, factor);

          if (thetanew <= thetamin) {
            continue;
          }

          lines.push({
            start: getPointByAngle(thetaold, factor, config.angleoffset, rate),
            end: getPointByAngle(thetanew, factor, config.angleoffset, rate)
          });
        }
      }

      return lineSegments;
    }
  }

  function stroke(color, alpha) {
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
  }

  function getPointByAngle(theta, factor, angleoffset, rate) {
    var x = theta * factor *  Math.cos(theta + angleoffset);
    var z = - theta * factor * Math.sin(theta + angleoffset);
    var y = rate * theta;
    // ahora que tenemos coordenadas 3d, proyectarlas en el espacio 2d:
    var point = projectTo2d(x, y, z);
    // calcular el nivel alfa de color del punto:s
    point.alpha = Math.atan((y * factor / rate * 0.1 + 0.02 - z) * 40) * 0.35 + 0.65;

    return point;
  }

  function getdtheta(theta, lineLength, rate, factor) {
    return lineLength / Math.sqrt(rate * rate + factor * factor * theta * theta);
  }

  function projectTo2d(x, y, z) {
    return {
      x: xscreenoffset + xscreenscale * (x / (z - zcamera)),
      y: yscreenoffset + yscreenscale * ((y - ycamera) / (z - zcamera))
    };
  }

  // De hecho, quiero que sea más lento que 60 fps
  function requestAnimationFrame(callback) {
    window.setTimeout(callback, 1000 / 24);
  }
}
