let canvas;
var pg;
var mask;
var bgpg;
var blurpass1;
var blurpass2;
var effectpass;

let effect;
let blurH;
let blurV;

var cl1, cl2, cl3, cl4;

var mm;
var WW, HH;
var resx = 1400;
var resy = 1400;
var res = 1400;
var zoom = .8;
var globalseed = Math.floor(fxrand()*1000000);

var hasmargin = 1.0 * (fxrand()*100 < 50);

var pts = [];
///////
/*function getOrthoString(value) {
    if (value) return "yes";
    else return "no";
}
function getCountString(value) {
    if (value) return "big";
    else return "small";
}

window.$fxhashFeatures = {
    "ortho": getOrthoString(orth),
    "exploded": getOrthoString(crazy),
    "mono": getOrthoString(ismono),
    "count": getCountString(afew),
    "uniform": getOrthoString(uniform && (!crazy)),
}*/
///////

var palettesstrings = [
    'f46036-5b85aa-414770-372248-f55d3e-878e88-f7cb15-76bed0-9cfffa-acf39d-b0c592-a97c73-af3e4d',
    '121212-F05454-30475E-F5F5F5-F39189-BB8082-6E7582-046582',
    '084c61-db504a-e3b505-4f6d7a-56a3a6-177e89-084c61-db3a34-ffc857-323031',
    '32373b-4a5859-f4d6cc-f4b860-c83e4d-de6b48-e5b181-f4b9b2-daedbd-7dbbc3',
    'fa8334-fffd77-ffe882-388697-54405f-ffbc42-df1129-bf2d16-218380-73d2de',
    '3e5641-a24936-d36135-282b28-83bca9-ed6a5a-f4f1bb-9bc1bc-e6ebe0-36c9c6',
    '304d7d-db995a-bbbbbb-222222-fdc300-664c43-873d48-dc758f-e3d3e4-00ffcd',
    '5fad56-f2c14e-f78154-4d9078-b4431c-8789c0-45f0df-c2cae8-8380b6-111d4a',
    '4C3A51-774360-B25068-FACB79-dddddd-2FC4B2-12947F-E71414-F17808-Ff4828',
    '087e8b-ff5a5f-3c3c3c-f5f5f5-c1839f-1B2430-51557E-816797-D6D5A8-ff2222',
    '4C3F61-B958A5-9145B6-FF5677-65799B-C98B70-EB5353-394359-F9D923-36AE7C-368E7C-187498',
    '283d3b-197278-edddd4-c44536-772e25-0d3b66-faf0ca-f4d35e-ee964b-f95738-fe5d26-f2c078-faedca-c1dbb3-7ebc89-3d5a80-98c1d9-e0fbfc-ee6c4d-293241',
    '99e2b4-99d4e2-f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1',
    '080708-3772ff-df2935-fdca40-e6e8e6-d8dbe2-a9bcd0-58a4b0-373f51-1b1b1e',
];
var palettes = [];
palettesstrings.forEach(stri => {
  var palette = [];
  var swatches = stri.split('-');
  for(var s = 0; s < swatches.length; s++){
    palette.push(hex2rgb(swatches[s]));
  }
  palettes.push(palette);
})


var palette0 = palettes[Math.floor(palettes.length*fxrand())];
palette0 = shuffle(palette0);

function getRandomColor(pal){
    if(pal){
        return pal[Math.floor(pal.length*fxrand())];
    }
    else{
        return palette0[Math.floor(palette0.length*fxrand())];
    }
}

function preload() {
    effect = loadShader('assets/effect.vert', 'assets/effect.frag');
    blurH = loadShader('assets/blur.vert', 'assets/blur.frag');
    blurV = loadShader('assets/blur.vert', 'assets/blur.frag');
}

function setup(){
    mm = min(windowWidth, windowHeight);
    pixelDensity(2);
    canvas = createCanvas(round(mm*resx/resy), mm, WEBGL);
    canvas.id('maincanvas');
    imageMode(CENTER);
    
    randomSeed(globalseed);
    noiseSeed(globalseed+123.1341);

    print('fxhash:', fxhash);

    pg = createGraphics(resx, resy);
    pg.noStroke();
    pg.strokeJoin(ROUND);
    mask = createGraphics(resx, resy);
    mask.noStroke();
    mask.clear();
    mask.background(255);
    mask.noStroke();
    mask.fill(255);
    
    bgpg = createGraphics(res, res);
    bgpg.noStroke();
    bgpg.clear();
    bgpg.background(0);
    bgpg.noStroke();
    bgpg.fill(255);
    //mask.strokeJoin(ROUND);

    blurpass1 = createGraphics(resx, resy, WEBGL);
    blurpass2 = createGraphics(resx, resy, WEBGL);
    effectpass = createGraphics(resx, resy, WEBGL);
    blurpass1.noStroke();
    blurpass2.noStroke();
    effectpass.noStroke();
    imageMode(CENTER);
    colorMode(RGB, 1);

    
    pg.clear();


    createShapes();

    //drawShapes();
    //showall();
    //showall();
    //fxpreview();
}

function draw(){
    drawShapes();
    showall();
}

var s = "HELLO";
var binsum = 0;
var timer = -1;
var num = 20;

function issamepoint(p1, p2){
    return p1.dist(p2) < 0.1;
}

function findLineIntersection(u, w, v, z){
    var uw = p5.Vector.sub(w, u);
    var vz = p5.Vector.sub(z, v);
    var uv = p5.Vector.sub(v, u);
    let beta = uw.angleBetween(vz);
    if(beta < radians(0.1))
        return false;
    let alfa = uw.angleBetween(uv);

    var vz_ = p5.Vector.sub(z, v);
    vz_.normalize();
    var mmag = -uv.mag() * sin(alfa) / sin(beta);
    if(mmag < 0 || mmag > vz.mag())
        return false;
    vz_.mult(mmag);
    var res = p5.Vector.add(v, vz_);
    return res;
}


function onSegment(p, q, r){
    if (q.x <= max(p.x, r.x) && q.x >= min(p.x, r.x) &&
        q.y <= max(p.y, r.y) && q.y >= min(p.y, r.y))
       return true;
 
    return false;
}

function triorientation(p, q, r){
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    var val = (q.y - p.y) * (r.x - q.x) -
              (q.x - p.x) * (r.y - q.y);
 
    if (val == 0) return 0;  // collinear
 
    return (val > 0)? 1 : 2; // clock or counterclock wise
}

function doLinesIntersect(p1, q1, p2, q2){
    // Find the four orientations needed for general and
    // special cases
    var o1 = triorientation(p1, q1, p2);
    var o2 = triorientation(p1, q1, q2);
    var o3 = triorientation(p2, q2, p1);
    var o4 = triorientation(p2, q2, q1);
 
    // General case
    if (o1 != o2 && o3 != o4)
        return true;
 
    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
 
    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
 
    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
 
     // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
 
    return false; // Doesn't fall in any of the above cases
}


function isinside(point, poly) {
    let wn = 0;
  
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      let pi = poly[i];
      let pj = poly[j];
  
      if (pj.y <= point.y) {
        if (pi.y > point.y) {
          if (isLeft(pj, pi, point) > 0) {
            wn++;
          }
        }
      } else {
        if (pi.y <= point.y) {
          if (isLeft(pj, pi, point) < 0) {
            wn--;
          }
        }
      }
    }
    return wn != 0;
  };
  
  function isLeft(P0, P1, P2) {
    let res = ( (P1.x - P0.x) * (P2.y - P0.y)
              - (P2.x -  P0.x) * (P1.y - P0.y) );
    return res;
  }


function createShapes(){
    
    const pgw = pg.width;
    const pgh = pg.height;

    pts = [];
    var ang = fxrand()*3.14;
    var r = random(100, 130);
    for(var k = 0; k < 15; k++){
        var rr = r * random(.8, 2.2);
        var x = rr*cos(ang);
        var y = rr*sin(ang);
        ang += 2*PI/3 + radians(random(-20, 20));
        //x = random(-200, 200);
        //y = random(-200, 200);
        //pts.push([x, y]);
    }
    //pts.push([x+random(-30, 30), y+100]);
    //pts.push([x+random(-30, 30), y+200]);
    //pts.push([x+random(-30, 30), y+300]);
    //pts.push([x+random(-30, 30), y+400]);
    //pts.push([x+random(-30, 30), y+500]);
    //pts.push([x+random(-30, 30), y+600]);

    for(var k = 0; k < 35; k++){
        var x = -200 + 400*(k%2);
        var y = random(-res/2, res/2)*.5;
        var x = random(-res/2, res/2)*.5;
        pts.push([x, y]);
    }

    for(var k = 0; k < 10; k++){
        var x = map(k, 0, 10-1, -200, 200);
        var y = random(-277, 277);
        //y = 555*(-.5 + power(noise(k*.4, 5), 5));
        //pts.push([x, y]);
    }

    
    
    /*var dgr = 5;
    print(pts)
    var bez = new BSpline(pts, dgr, true);

    pg.push();
    pg.translate(0, 0);
    pg.stroke(...getRandomColor());
    pg.noFill();
    pg.beginShape();
    for(var k = 0; k < 222; k++){
        var p = map(k, 0, 222-1, 0, 1);
        var pt = bez.calcAt(p);
        //pg.vertex(pt[0], pt[1]);
    }
    pg.endShape();
    pg.pop();*/
}

function drawShapes(){
    const pgw = pg.width;
    const pgh = pg.height;

    pg.push();
    mask.push();
    pg.translate(pgw/2, pgh/2);
    mask.translate(pgw/2, pgh/2);

    pg.colorMode(RGB, 1);
    pg.rectMode(CENTER);

    pg.background(...getRandomColor());
    pg.background(0.1);
    
    var ten = .995 + .1*power(noise(frameCount*2.05), 5);
    ten = .995 + .041*fxrand();
    var knots = makeknots(pts, ten, true);
    mp_make_choices(knots[0]);

    for(var k = 0; k < 1; k++){
        pg.push();
        pg.translate(0, k);
        pg.noStroke();
        pg.fill(palette0[k%palette0.length]);
        //drawhobby(pg, knots, true);
        pg.pop();
    }

    for(var k = 0; k < 4; k++){
        pg.push();
        pg.translate(0, k);
        pg.noFill();
        pg.stroke(palette0[k%palette0.length]);
        drawhobby(pg, knots, true);
        pg.pop();
    }
    pg.push();
    pg.translate(0, 0);
    pg.stroke(...getRandomColor());
    pg.stroke(.4, .4, .4);
    pg.noFill();
    pg.beginShape();
    pts.forEach(pt => {
        //pg.vertex(pt[0], pt[1]);
    });
    pg.endShape();
    pg.pop();
    
    pts.forEach(pt => {
        pg.fill(...getRandomColor());
        pg.fill(.9);
        pg.noStroke();
        //pg.ellipse(pt[0], pt[1]+y, 5, 5);
    });

    pg.pop();
    mask.pop();
}

function drawhobby(pgr, knots, cycle) {
    
    pgr.beginShape();
    pgr.vertex(knots[0].x_pt, knots[0].y_pt);
    for (var i=0; i<knots.length-1; i++) {
      //   knots[i+1].lx_pt.toFixed(4), knots[i+1].ly_pt.toFixed(4),
      //   knots[i+1].x_pt.toFixed(4), knots[i+1].y_pt.toFixed(4));
        
        pgr.bezierVertex(
            knots[i].rx_pt, knots[i].ry_pt,
            knots[i+1].lx_pt, knots[i+1].ly_pt,
            knots[i+1].x_pt, knots[i+1].y_pt,
        );
  
        //pgr.push();
        //pgr.noStroke();
        //pgr.fill(...getRandomColor());
        //pgr.ellipse(knots[i].x_pt,  knots[i].y_pt, 3, 3);
        //pgr.ellipse(knots[i].rx_pt, knots[i].ry_pt, 1, 1);
        //pgr.ellipse(knots[i+1].lx_pt, knots[i+1].ly_pt, 1, 1);
        //pgr.ellipse(knots[i+1].x_pt,  knots[i+1].y_pt, 3, 3);
        //pgr.pop();
    }
    if (cycle) {
        i = knots.length-1;
        pgr.bezierVertex(
            knots[i].rx_pt, knots[i].ry_pt ,
            knots[0].lx_pt, knots[0].ly_pt,
            knots[0].x_pt, knots[0].y_pt,
        );
    }
    pg.endShape();
}

function map(v, v1, v2, v3, v4){
    return (v-v1)/(v2-v1)*(v4-v3)+v3;
}


function showall(){
    background(222);
    pg.push();
    //pg.scale(0.8);
    pg.pop();
    //pg.line(0,0,mouseX-width/2,mouseY-height/2);

    var an = fxrand()*PI;
    var dir = [cos(an), sin(an)]
    blurH.setUniform('tex0', pg);
    blurH.setUniform('tex1', mask);
    blurH.setUniform('texelSize', [1.0/resx, 1.0/resy]);
    blurH.setUniform('direction', [dir[0], [1]]);
    blurH.setUniform('u_time', frameCount*0+globalseed*.01);
    blurH.setUniform('amp', .03);
    blurH.setUniform('seed', (globalseed*.12134)%33.+random(.1,11));
    blurpass1.shader(blurH);
    blurpass1.quad(-1,-1,1,-1,1,1,-1,1);
    
    blurV.setUniform('tex0', blurpass1);
    blurH.setUniform('tex1', mask);
    blurV.setUniform('texelSize', [1.0/resx, 1.0/resy]);
    blurV.setUniform('direction', [-dir[1], [0]]);
    blurV.setUniform('u_time', frameCount*0+globalseed*.01);
    blurV.setUniform('amp', .03);
    blurV.setUniform('seed', (globalseed*.12134)%33.+random(.1,11));
    blurpass2.shader(blurV);
    blurpass2.quad(-1,-1,1,-1,1,1,-1,1);

    effect.setUniform('tex0', blurpass2);
    effect.setUniform('tex1', pg);
    effect.setUniform('tex2', mask);
    effect.setUniform('tex3', bgpg);
    effect.setUniform('u_usemask', 0.);
    effect.setUniform('u_resolution', [resx, resy]);
    effect.setUniform('u_mouse',[dir[0], [1]]);
    effect.setUniform('u_time', frameCount);
    effect.setUniform('incolor', [map(fxrand(), 0, 1, .99, 1.), map(fxrand(), 0, 1, .99, 1.), .99, 1.]);
    effect.setUniform('seed', globalseed+random(.1,11));
    effect.setUniform('noiseamp', mouseX/width*0+1);
    effect.setUniform('hasmargin', hasmargin);
    //effect.setUniform('tintColor', HSVtoRGB(fxrand(), 0.2, 0.95));
    var hue1 = fxrand();
   //effect.setUniform('tintColor', HSVtoRGB(fxrand(),.3,.9));
    //effect.setUniform('tintColor2', HSVtoRGB((hue1+.45+fxrand()*.1)%1,.3,.9));
    var ridx1 = floor(fxrand()*palette0.length)
    var ridx2 = floor(fxrand()*palette0.length)
    effect.setUniform('tintColor', palette0[ridx1]);
    effect.setUniform('tintColor2', palette0[ridx2]);
    effectpass.shader(effect);
    effectpass.quad(-1,-1,1,-1,1,1,-1,1);
  
    // draw the second pass to the screen
    //image(effectpass, 0, 0, mm-18, mm-18);
    var xx = 0;
    image(effectpass, 0, 0, mm*resx/resy-xx, mm-xx);

}

function mouseClicked(){
    //createShapes();
}

function keyPressed(){
    noiseSeed(round(random(1000)));
    createShapes();
}

var wheads = [];

function rnoise(s, v1, v2){
    return v1 + (v2-v1)*((power(noise(s), 3)*1)%1.0);
}

function windowResized() {
    mm = min(windowWidth, windowHeight);
    resizeCanvas(round(mm*resx/resy), mm);
    var xx = 0;
    image(effectpass, 0, 0, mm*resx/resy-xx, mm-xx);
}

function power(p, g) {
    if (p < 0.5)
        return 0.5 * Math.pow(2*p, g);
    else
        return 1 - 0.5 * Math.pow(2*(1 - p), g);
}


/////////////////////////////////////////////////////

////// COURTESY OF Tagussan https://github.com/Tagussan/BSpline

var BSpline = function(points,degree,copy){
    if(copy){
        this.points = []
        for(var i = 0;i<points.length;i++){
            this.points.push(points[i]);
        }
    }else{
        this.points = points;
    }
    this.degree = degree;
    this.dimension = points[0].length;
    if(degree == 2){
        this.baseFunc = this.basisDeg2;
        this.baseFuncRangeInt = 2;
    }else if(degree == 3){
        this.baseFunc = this.basisDeg3;
        this.baseFuncRangeInt = 2;
    }else if(degree == 4){
        this.baseFunc = this.basisDeg4;
        this.baseFuncRangeInt = 3;
    }else if(degree == 5){
        this.baseFunc = this.basisDeg5;
        this.baseFuncRangeInt = 3;
    } 
};

BSpline.prototype.seqAt = function(dim){
    var points = this.points;
    var margin = this.degree + 1;
    return function(n){
        if(n < margin){
            return points[0][dim];
        }else if(points.length + margin <= n){
            return points[points.length-1][dim];
        }else{
            return points[n-margin][dim];
        }
    };
};

BSpline.prototype.basisDeg2 = function(x){
    if(-0.5 <= x && x < 0.5){
        return 0.75 - x*x;
    }else if(0.5 <= x && x <= 1.5){
        return 1.125 + (-1.5 + x/2.0)*x;
    }else if(-1.5 <= x && x < -0.5){
        return 1.125 + (1.5 + x/2.0)*x;
    }else{
        return 0;
    }
};

BSpline.prototype.basisDeg3 = function(x){
    if(-1 <= x && x < 0){
        return 2.0/3.0 + (-1.0 - x/2.0)*x*x;
    }else if(1 <= x && x <= 2){
        return 4.0/3.0 + x*(-2.0 + (1.0 - x/6.0)*x);
    }else if(-2 <= x && x < -1){
        return 4.0/3.0 + x*(2.0 + (1.0 + x/6.0)*x);
    }else if(0 <= x && x < 1){
        return 2.0/3.0 + (-1.0 + x/2.0)*x*x;
    }else{
        return 0;
    }
};

BSpline.prototype.basisDeg4 = function(x){
    if(-1.5 <= x && x < -0.5){
        return 55.0/96.0 + x*(-(5.0/24.0) + x*(-(5.0/4.0) + (-(5.0/6.0) - x/6.0)*x));
    }else if(0.5 <= x && x < 1.5){
        return 55.0/96.0 + x*(5.0/24.0 + x*(-(5.0/4.0) + (5.0/6.0 - x/6.0)*x));
    }else if(1.5 <= x && x <= 2.5){
        return 625.0/384.0 + x*(-(125.0/48.0) + x*(25.0/16.0 + (-(5.0/12.0) + x/24.0)*x));
    }else if(-2.5 <= x && x <= -1.5){
        return 625.0/384.0 + x*(125.0/48.0 + x*(25.0/16.0 + (5.0/12.0 + x/24.0)*x));
    }else if(-1.5 <= x && x < 1.5){
        return 115.0/192.0 + x*x*(-(5.0/8.0) + x*x/4.0);
    }else{
        return 0;
    }
};

BSpline.prototype.basisDeg5 = function(x){
    if(-2 <= x && x < -1){
        return 17.0/40.0 + x*(-(5.0/8.0) + x*(-(7.0/4.0) + x*(-(5.0/4.0) + (-(3.0/8.0) - x/24.0)*x)));
    }else if(0 <= x && x < 1){
        return 11.0/20.0 + x*x*(-(1.0/2.0) + (1.0/4.0 - x/12.0)*x*x);
    }else if(2 <= x && x <= 3){
        return 81.0/40.0 + x*(-(27.0/8.0) + x*(9.0/4.0 + x*(-(3.0/4.0) + (1.0/8.0 - x/120.0)*x)));
    }else if(-3 <= x && x < -2){
        return 81.0/40.0 + x*(27.0/8.0 + x*(9.0/4.0 + x*(3.0/4.0 + (1.0/8.0 + x/120.0)*x)));
    }else if(1 <= x && x < 2){
        return 17.0/40.0 + x*(5.0/8.0 + x*(-(7.0/4.0) + x*(5.0/4.0 + (-(3.0/8.0) + x/24.0)*x)));
    }else if(-1 <= x && x < 0){
        return 11.0/20.0 + x*x*(-(1.0/2.0) + (1.0/4.0 + x/12.0)*x*x);
    }else{
        return 0;
    }
};

BSpline.prototype.getInterpol = function(seq,t){
    var f = this.baseFunc;
    var rangeInt = this.baseFuncRangeInt;
    var tInt = Math.floor(t);
    var result = 0;
    for(var i = tInt - rangeInt;i <= tInt + rangeInt;i++){
        result += seq(i)*f(t-i);
    }
    return result;
};

BSpline.prototype.calcAt = function(t){
    t = t*((this.degree+1)*2+this.points.length);//t must be in [0,1]
    if(this.dimension == 2){
        return [this.getInterpol(this.seqAt(0),t),this.getInterpol(this.seqAt(1),t)];
    }else if(this.dimension == 3){
        return [this.getInterpol(this.seqAt(0),t),this.getInterpol(this.seqAt(1),t),this.getInterpol(this.seqAt(2),t)];
    }else{
        var res = [];
        for(var i = 0;i<this.dimension;i++){
            res.push(this.getInterpol(this.seqAt(i),t));
        }
        return res;
    }
};

/**
 * Converts RGB color to CIE 1931 XYZ color space.
 * https://www.image-engineering.de/library/technotes/958-how-to-convert-between-srgb-and-ciexyz
 * @param  {string} hex
 * @return {number[]}
 */
 function rgbToXyz(rgb) {
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];
    const X =  0.4124 * r + 0.3576 * g + 0.1805 * b
    const Y =  0.2126 * r + 0.7152 * g + 0.0722 * b
    const Z =  0.0193 * r + 0.1192 * g + 0.9505 * b
    // For some reason, X, Y and Z are multiplied by 100.
    return [X, Y, Z].map(_ => _ * 100)
}

/**
 * Undoes gamma-correction from an RGB-encoded color.
 * https://en.wikipedia.org/wiki/SRGB#Specification_of_the_transformation
 * https://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
 * @param  {number}
 * @return {number}
 */
function sRGBtoLinearRGB(color) {
    // Send this function a decimal sRGB gamma encoded color value
    // between 0.0 and 1.0, and it returns a linearized value.
    if (color <= 0.04045) {
        return color / 12.92
    } else {
        return Math.pow((color + 0.055) / 1.055, 2.4)
    }
}

/**
 * Converts hex color to RGB.
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param  {string} hex
 * @return {number[]} [rgb]
 */
function hexToRgb(hex) {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (match) {
        match.shift()
        return match.map(_ => parseInt(_, 16))
    }
}

/**
 * Converts CIE 1931 XYZ colors to CIE L*a*b*.
 * The conversion formula comes from <http://www.easyrgb.com/en/math.php>.
 * https://github.com/cangoektas/xyz-to-lab/blob/master/src/index.js
 * @param   {number[]} color The CIE 1931 XYZ color to convert which refers to
 *                           the D65/2° standard illuminant.
 * @returns {number[]}       The color in the CIE L*a*b* color space.
 */
// X, Y, Z of a "D65" light source.
// "D65" is a standard 6500K Daylight light source.
// https://en.wikipedia.org/wiki/Illuminant_D65
const D65 = [95.047, 100, 108.883]
function xyzToLab([x, y, z]) {
  [x, y, z] = [x, y, z].map((v, i) => {
    v = v / D65[i]
    return v > 0.008856 ? Math.pow(v, 1 / 3) : v * 7.787 + 16 / 116
  })
  const l = 116 * y - 16
  const a = 500 * (x - y)
  const b = 200 * (y - z)
  return [l, a, b]
}

/**
 * Converts Lab color space to Luminance-Chroma-Hue color space.
 * http://www.brucelindbloom.com/index.html?Eqn_Lab_to_LCH.html
 * @param  {number[]}
 * @return {number[]}
 */
function labToLch([l, a, b]) {
    const c = Math.sqrt(a * a + b * b)
    const h = abToHue(a, b)
    return [l, c, h]
}

/**
 * Converts a and b of Lab color space to Hue of LCH color space.
 * https://stackoverflow.com/questions/53733379/conversion-of-cielab-to-cielchab-not-yielding-correct-result
 * @param  {number} a
 * @param  {number} b
 * @return {number}
 */
function abToHue(a, b) {
    if (a >= 0 && b === 0) {
        return 0
    }
    if (a < 0 && b === 0) {
        return 180
    }
    if (a === 0 && b > 0) {
        return 90
    }
    if (a === 0 && b < 0) {
        return 270
    }
    let xBias
    if (a > 0 && b > 0) {
        xBias = 0
    } else if (a < 0) {
        xBias = 180
    } else if (a > 0 && b < 0) {
        xBias = 360
    }
    return radiansToDegrees(Math.atan(b / a)) + xBias
}

function radiansToDegrees(radians) {
    return radians * (180 / Math.PI)
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180
}

/**
 * Saturated colors appear brighter to human eye.
 * That's called Helmholtz-Kohlrausch effect.
 * Fairchild and Pirrotta came up with a formula to
 * calculate a correction for that effect.
 * "Color Quality of Semiconductor and Conventional Light Sources":
 * https://books.google.ru/books?id=ptDJDQAAQBAJ&pg=PA45&lpg=PA45&dq=fairchild+pirrotta+correction&source=bl&ots=7gXR2MGJs7&sig=ACfU3U3uIHo0ZUdZB_Cz9F9NldKzBix0oQ&hl=ru&sa=X&ved=2ahUKEwi47LGivOvmAhUHEpoKHU_ICkIQ6AEwAXoECAkQAQ#v=onepage&q=fairchild%20pirrotta%20correction&f=false
 * @return {number}
 */
function getLightnessUsingFairchildPirrottaCorrection([l, c, h]) {
    const l_ = 2.5 - 0.025 * l
    const g = 0.116 * Math.abs(Math.sin(degreesToRadians((h - 90) / 2))) + 0.085
    return l + l_ * g * c
}

function getPerceivedLightness(rgb) {
    return getLightnessUsingFairchildPirrottaCorrection(labToLch(xyzToLab(rgbToXyz(rgb))))
}