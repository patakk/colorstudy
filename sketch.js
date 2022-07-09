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

var isdark = fxrand() < 1.5;

var waa = map(fxrand(), 0, 1, .7, 2);

var detmin = 7;
var detmax = 16;
var detu = Math.round(map(power(fxrand(), 6.), 0, 1, detmin, detmax));
////////////

var numobjects = -1;
var option = Math.floor(map(fxrand(), 0, 1, 0, 2));
option = 0;
var ismono = fxrand() < .1;
var flipbw = fxrand() < .5;
var infill = fxrand() < .5;
var hasparallels = fxrand() < .5;
var hashollow = fxrand() < 1.5;
var afew = fxrand() < .5;
var uniform = fxrand() < .5;

var neocolor = false;
if(infill){
    if(fxrand() < .15){
        neocolor = true;
    }
}
var usemask = (option == 0) && afew && fxrand() < -1.25;

if(afew)
    uniform = true;
if(uniform){
    detu = Math.round(map(fxrand(), 0, 1, detmin, detmin+4));
}

var haswarp = (fxrand() < .5) && (option == 0) && uniform;
haswarp = false;
haswarp = true;
waa = 1.1;
if(ismono){
    haswarp = true;
    waa = 1.1;
    uniform = true;
    option = 0;
}

var crazy = fxrand() < .25;
if(crazy && !ismono && !afew){
    waa = -map(fxrand(), 0, 1, .5, 2);
    detu = Math.round(map(fxrand(), 0, 1, detmin/2, detmin/2+1));
}
if(!haswarp || ismono || afew)
    crazy = false;

var orth = 1.*(fxrand() < .2);
if(crazy){
    orth = 1.;
    afew = false;
}

if(afew)
    orth = 0.;

console.log('option:', option);
console.log('ismono:', ismono);
console.log('flipbw:', flipbw);
console.log('orth:', orth);
console.log('haswarp:', haswarp);
console.log('uniform:', uniform && (!crazy));
console.log('crazy:', crazy);
console.log('afew:', afew);
console.log('hasparallels:', hasparallels);
console.log('usemask:', usemask);

function getOrthoString(value) {
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
}
///////




var palettes1 = [
    ['f46036-5b85aa-414770-372248', 0],
   
]

var palettes0 = [
    'f46036-5b85aa-414770-372248',
    '084c61-db504a-e3b505-4f6d7a-56a3a6',
    '177e89-084c61-db3a34-ffc857-323031',
    '32373b-4a5859-f4d6cc-f4b860-c83e4d',
    'de6b48-e5b181-f4b9b2-daedbd-7dbbc3',
    'f55d3e-878e88-f7cb15-76bed0',
    'ffbc42-df1129-bf2d16-218380-73d2de',
    'fa8334-fffd77-ffe882-388697-54405f',
    'ed6a5a-f4f1bb-9bc1bc-e6ebe0-36c9c6',
    '3e5641-a24936-d36135-282b28-83bca9',
    '664c43-873d48-dc758f-e3d3e4-00ffcd',
    '304d7d-db995a-bbbbbb-222222-fdc300',
    '8789c0-45f0df-c2cae8-8380b6-111d4a',
    '006466-065a60-fb525b-144552-1b3a4b-212f45-272640-fb525b-312244-3e1f47-4d194d',
    '5fad56-f2c14e-f78154-4d9078-b4431c',
    '2FC4B2-12947F-E71414-F17808-Ff4828',
    'F39189-BB8082-6E7582-046582',
    'EB5353-394359-F9D923-36AE7C-368E7C-187498',
    '4C3F61-B958A5-9145B6-FF5677-65799B-C98B70',
    '121212-F05454-30475E-F5F5F5',
    '4C3A51-774360-B25068-FACB79-dddddd',
    '1B2430-51557E-816797-D6D5A8-ff2222',
    '087e8b-ff5a5f-3c3c3c-f5f5f5-c1839f',
    '283d3b-197278-edddd4-c44536-772e25-0d3b66-faf0ca-f4d35e-ee964b-f95738-fe5d26-f2c078-faedca-c1dbb3-7ebc89-3d5a80-98c1d9-e0fbfc-ee6c4d-293241',
    '99e2b4-99d4e2-f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1',
    '080708-3772ff-df2935-fdca40-e6e8e6-d8dbe2-a9bcd0-58a4b0-373f51-1b1b1e',
    'ea8c55-e27e52-d96f4e-cd5c46-ba4035-dddddd-972320-81171b-540804-3c0000-006868',
]

if(neocolor){
    palettes0 = [
        'ff0000-ff8700-ffd300-deff0a-a1ff0a-0aff99-0aefff-147df5-580aff-be0aff'
    ]
}

var palettes = [];
palettes0.forEach(element => {
    palettes.push(element);
});


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16)/255.,
      parseInt(result[2], 16)/255.,
      parseInt(result[3], 16)/255.
    ] : null;
}


var palette;
var thidx;


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

    
    thidx = Math.floor(map(fxrand(), 0, 1, 0, palettes.length));
    for(var k = 0; k < palettes.length; k++){
        let text = palettes[k];
        let cols = text.split('-')
        let caca = [];
        var darkenr = .6;
        var darkeng = .6;
        var darkenb = .6;
        if(isdark){
            darkenr = 1;
            darkeng = 1;
            darkenb = 1;
        }
        else{
            var rrr = floor(random(3));
            if(rrr == 0){
                darkenr = 1.;
            }
        }
        cols.forEach((e)=>{
            var hhh = hexToRgb(e);
            var gg = 0.3*hhh[0] + 0.59*hhh[1] + 0.11*hhh[2];
            if(gg < .3){
                hhh[0] *= .3/gg;
                hhh[1] *= .3/gg;
                hhh[2] *= .3/gg;
            }
            caca.push(hhh);
        });
        //shuffle(caca)
        var coco = [];
        caca.forEach((e, i)=>{coco.push([(1.*caca[i][0]+.01*map(fxrand(), 0, 1, -.2, .2)), (1.*caca[i][1]+.01*map(fxrand(), 0, 1, -.2, .2)), (1.*caca[i][2]+.01*map(fxrand(), 0, 1, -.2, .2))])});
        palettes[k] = coco;
    }

    palette = palettes[thidx]
    bgidx = floor(fxrand()*(palette.length))
    print('palette:', palettes0[thidx])
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
    //noCursor();

    //envelope.play(osc);
    colorMode(RGB, 255);


    //generateHeads(20, 31114);
    //frameRate(5);
    
    background(100);
    pg.clear();

    cl1 = color(222, 222, 222);
    cl2 = color(30, 30, 30);
    cl3 = color(222, 222, 222);
    cl4 = color(30, 30, 30);

    pg.background(palette[bgidx][0]*180+44, palette[bgidx][1]*180+44, palette[bgidx][2]*180+44);
    //if(usemask)
    //    pg.background(222);

    bgpg.background(palette[(bgidx+3)%palette.length][0]*255, palette[(bgidx+3)%palette.length][1]*255, palette[(bgidx+3)%palette.length][2]*255);
    
    if(ismono){
        if(fxrand() < .5){
            pg.background(cl2);
            bgpg.background(red(cl2)+7, green(cl2)+7, blue(cl2)+7);
        }
        else{
            pg.background(cl1);
            bgpg.background(red(cl1)+9, green(cl1)+9, blue(cl1)+9);
        }
    }


    drawShapes3();    


    showall();
    showall();
    fxpreview();
    //savepost();
}

/*function savepost(){
    var dataimg = document.getElementById('maincanvas');
    var imgURL = dataimg.toDataURL();
    console.log(imgURL);
    $.ajax({
      type: "POST",
      url: "http://url/take_pic", //I have doubt about this url, not sure if something specific must come before "/take_pic"
      data: imgURL,
      success: function(data) {
        if (data.success) {
          alert('Your file was successfully uploaded!');
        } else {
          alert('There was an error uploading your file!');
        }
      },
      error: function(data) {
        alert('There was an error uploading your file!');
      }
    }).done(function() {
      console.log("Sent");
    });
}*/

var s = "HELLO";
var binsum = 0;
var timer = -1;
var num = 20;

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    var ltns = ll1*r + ll2*g + ll3*b;
    r = min(1., max(0., r * l / ltns));
    g = min(1., max(0., g * l / ltns));
    b = min(1., max(0., b * l / ltns));

    return {'r': Math.round(r * 255), 'g': Math.round(g * 255), 'b': Math.round(b * 255)};
}

const ll1 = .299;
const ll2 = .587;
const ll3 = .114;

function generateLines(poly, detail){

    var centroid = createVector(0, 0);
    for(var k = 0; k < poly.length; k++){
        centroid.add(poly[k]);
    }
    centroid.div(poly.length);
    var maxr = -1000;
    for(var k = 0; k < poly.length; k++){
        var d = poly[k].dist(centroid);
        if(d > maxr){
            maxr = d;
        }
    }

    var steps = 2 * round(maxr/detail);

    var v1 = createVector(1, 0);
    v1.rotate(random(100));

    var cp = centroid.copy();
    cp.add(p5.Vector.mult(v1, maxr+2*detail))
    v1.mult(-1);

    var lines = [];
    for(var k = 0; k < steps+4; k++){
        var perp = v1.copy();
        perp.rotate(PI/2);
        var p1 = p5.Vector.add(cp, p5.Vector.mult(perp, +maxr));
        var p2 = p5.Vector.add(cp, p5.Vector.mult(perp, -maxr));
        lines.push([p1, p2]);
        cp.add(p5.Vector.mult(v1, detail));       
    }

    return lines;
}

function cutoutLines(lines, poly){
    
    var nlines = [];
    for(var l = 0; l < lines.length; l++){
        var ll = lines[l];
        var a1 = ll[0];
        var b1 = ll[1];

        var allinterpts = [];
        for(var k = 0; k < poly.length; k++){
            var a2 = poly[k];
            var b2 = poly[(k+1)%poly.length];

            var inte = doLinesIntersect(a1, b1, a2, b2);
            if(inte){
                var interpt1 = findLineIntersection(a1, b1, a2, b2);
                var interpt2 = findLineIntersection(a2, b2, a1, b1);
                var interpt = false;
                if(interpt1){
                    interpt = interpt1;
                }
                else if(interpt2){
                    interpt = interpt2;
                }
                if(interpt){
                    allinterpts.push(interpt);
                    //pg.fill(1);
                    //pg.noStroke();
                    //pg.ellipse(interpt.x, interpt.y, 10, 10 );
                }
            }
        }
        var ptbydist = {};
        for(var ii = 0; ii < allinterpts.length; ii++){
            var intpt = allinterpts[ii];
            var d = intpt.dist(a1);
            ptbydist[d] = intpt;
        }
        var distvals = Object.keys(ptbydist);
        distvals.sort();
        for (var i=0; i<distvals.length-1; i+=2) {
            var key1 = distvals[i];
            var value1 = ptbydist[key1];
            var key2 = distvals[i+1];
            var value2 = ptbydist[key2];
            
            nlines.push([value1, value2])
        }
    }

    return nlines;
}


function trimLines(lines, poly){
    
    var nlines = [];
    for(var l = 0; l < lines.length; l++){
        var ll = lines[l];
        var a1 = ll[0];
        var b1 = ll[1];

        var allinterpts = [];
        for(var k = 0; k < poly.length; k++){
            var a2 = poly[k];
            var b2 = poly[(k+1)%poly.length];

            var inte = doLinesIntersect(a1, b1, a2, b2);
            if(inte){
                var interpt1 = findLineIntersection(a1, b1, a2, b2);
                var interpt2 = findLineIntersection(a2, b2, a1, b1);
                var interpt = false;
                if(interpt1){
                    interpt = interpt1;
                }
                else if(interpt2){
                    interpt = interpt2;
                }
                if(interpt){
                    allinterpts.push(interpt);
                    //pg.fill(1);
                    //pg.noStroke();
                    //pg.ellipse(interpt.x, interpt.y, 10, 10 );
                }
            }
        }
        var ptbydist = {};
        for(var ii = 0; ii < allinterpts.length; ii++){
            var intpt = allinterpts[ii];
            var d = intpt.dist(a1);
            ptbydist[d] = intpt;
        }
        var distvals = Object.keys(ptbydist);
        distvals.sort();
        if(allinterpts.length == 0){
            nlines.push([a1, b1])
        }
        else{
            nlines.push([a1, ptbydist[distvals[0]]])
            for (var i=0; i<distvals.length-1; i+=2) {
                var key1 = distvals[i];
                var value1 = ptbydist[key1];
                var key2 = distvals[i+1];
                var value2 = ptbydist[key2];
                
                nlines.push([value1, value2])
            }
            nlines.push([ptbydist[distvals[distvals.length-1]], b1])
        }
    }

    return nlines;
}

function drawShapes3(){
    //var clipper = new SutherlandHodgemanClipper (this.bounds);
    //poly = clipper.clipPolygon(poly);
    const pgw = pg.width;
    const pgh = pg.height;

    pg.push();
    mask.push();
    pg.translate(pgw/2, pgh/2);
    mask.translate(pgw/2, pgh/2);

    pg.colorMode(RGB, 255);
    //pg.rectMode(CENTER);


    var cc1 = [random(1), random(.2, .8), random(.726, .74)]
    var c1 = hslToRgb(...cc1);
    pg.background(c1.r, c1.g, c1.b);


    var polys = [];
    var centroids = [];
    for(var k = 0; k < 2; k++){
        var parts = round(random(5, 11));
        var x0 = random(-222, 222);
        var y0 = random(-222, 222);
        var r0 = random(100, 200);
        var poly = [];
        
    
        var centroid = createVector(0, 0);
        for(var pa = 0; pa < parts; pa++){
            var ang = map(pa, 0, parts, 0, 2*PI);
            ang += .2*2*PI*random(-1/parts, 1/parts);
            var r = r0 * random(.5, 2.2);
            var x = x0 + r * cos(ang);
            var y = y0 + r * sin(ang);
            centroid.x += x;
            centroid.y += y;
            poly.push(createVector(x, y));
        }
        centroid.div(parts);
        centroids.push(centroid);
        polys.push(poly);
    }

    pg.strokeWeight(2);
    for(var k = 0; k < polys.length; k++){
        var lines = generateLines(polys[k], 5);
        lines = cutoutLines(lines, polys[k]);
        for(var q = k+1; q < polys.length; q++){
            lines = trimLines(lines, polys[q]);
        }

        for(var l = 0; l < lines.length; l++){
            var ll = lines[l];
            pg.stroke(255*power(noise(k), 4));
            pg.line(ll[0].x, ll[0].y, ll[1].x, ll[1].y);
        }
    }


    pg.strokeWeight(4);
    for(var i = 0; i < polys.length; i++){
        let poly = polys[i];
        let col = hslToRgb(random(1), random(.3, .9), random(.1, .2));
        pg.stroke(col.r, col.g, col.b);
        pg.noFill();
        pg.beginShape();
        poly.forEach(vert => {
            var tv = vert.copy();
            //tv.sub(centroids[i]);
            //tv.mult(.9);
            //tv.add(centroids[i]);
            pg.vertex(tv.x, tv.y);
        });
        pg.endShape(CLOSE);
    }


    for(var k = 0; k < polys[1].length; k++){
        var xc = polys[1][k].x;
        var yc = polys[1][k].y;
        pg.fill(22,0,255);
        pg.noStroke();
        //pg.ellipse(xc, yc, 12+61*pow(k/polys[0].length, 2.), 12+61*pow(k/polys[0].length, 2.));
    }

    pg.pop();
    mask.pop();
}

function drawShapes2(){
    //var clipper = new SutherlandHodgemanClipper (this.bounds);
    //poly = clipper.clipPolygon(poly);
    const pgw = pg.width;
    const pgh = pg.height;

    pg.push();
    mask.push();
    pg.translate(pgw/2, pgh/2);
    mask.translate(pgw/2, pgh/2);

    pg.colorMode(RGB, 255);
    //pg.rectMode(CENTER);


    var cc1 = [random(1), random(.2, .8), random(.726, .74)]
    var c1 = hslToRgb(...cc1);
    pg.background(c1.r, c1.g, c1.b);


    var polys = [];
    var centroids = [];
    for(var k = 0; k < 2; k++){
        var parts = round(random(5, 11));
        var x0 = random(-100, 100);
        var y0 = random(-100, 100);
        var r0 = random(150, 200);
        var poly = [];
        
    
        var centroid = createVector(0, 0);
        for(var pa = 0; pa < parts; pa++){
            var ang = map(pa, 0, parts, 0, 2*PI);
            ang += .2*2*PI*random(-1/parts, 1/parts);
            var r = r0 * random(.5, 2.2);
            var x = x0 + r * cos(ang);
            var y = y0 + r * sin(ang);
            centroid.x += x;
            centroid.y += y;
            poly.push(createVector(x, y));
        }
        centroid.div(parts);
        centroids.push(centroid);
        polys.push(poly);
    }

    
    pg.strokeWeight(16);
    var unioned = union(polys[0], polys[1]);
    let c2 = hslToRgb(random(1), random(.3, .9), random(.1, .2));
    pg.stroke(c2.r, c2.g, c2.b);
    pg.stroke(255,0,0);
    pg.noFill();
    pg.beginShape();
    unioned.forEach(vert => {
        pg.vertex(vert.x, vert.y);
    });
    pg.endShape(CLOSE);


    pg.strokeWeight(4);
    for(var i = 0; i < polys.length; i++){
        let poly = polys[i];
        let col = hslToRgb(random(1), random(.3, .9), random(.1, .2));
        pg.stroke(col.r, col.g, col.b);
        pg.noFill();
        pg.beginShape();
        poly.forEach(vert => {
            var tv = vert.copy();
            //tv.sub(centroids[i]);
            //tv.mult(.9);
            //tv.add(centroids[i]);
            pg.vertex(tv.x, tv.y);
        });
        pg.endShape(CLOSE);
    }


    for(var k = 0; k < polys[1].length; k++){
        var xc = polys[1][k].x;
        var yc = polys[1][k].y;
        pg.fill(22,0,255);
        pg.noStroke();
        //pg.ellipse(xc, yc, 12+61*pow(k/polys[0].length, 2.), 12+61*pow(k/polys[0].length, 2.));
    }

    pg.pop();
    mask.pop();
}

function issamepoint(p1, p2){
    return p1.dist(p2) < 0.1;
}

function union(poly1, poly2){
    var firstid = 0;
    while(isinside(poly1[firstid], poly2)){
        firstid++;
        if(firstid == poly1.length) // if every poly1 point is in poly2, return poly2
            return poly2;
    }
    print('firstid', firstid)
    var poly = [];
    var coco = 0;
    var i = firstid;
    var firstpoint = poly1[firstid];
    var cpoly = poly1;
    var qpoly = poly2;
    var cpolyi = true;
    var finished = false;
    var a1, b1, c1;
    while(!finished && coco++ < 11){
        //a1 = cpoly[(i+0)%cpoly.length];
        if(!a1)
            a1 = cpoly[(i+0)%cpoly.length]
        b1 = cpoly[(i+1)%cpoly.length];
        c1 = cpoly[(i+2)%cpoly.length];

        if(poly.length > 2 && issamepoint(a1, firstpoint)){
            break;
        }

        var hasinters = false;

        var closest = 1000000;
        var closestp = false;
        var closestj = false;
        for(var j = 0; j < qpoly.length; j++){
            var a2 = qpoly[j];
            var b2 = qpoly[(j+1)%qpoly.length];

            var inte = doLinesIntersect(a1, b1, a2, b2);
            if(inte){
                hasinters = true;
                var interpt1 = findLineIntersection(a1, b1, a2, b2);
                var interpt2 = findLineIntersection(a2, b2, a1, b1);
                var interpt = false;
                if(interpt1){
                    interpt = interpt1;
                    var ia2d = interpt.dist(a1);
                    if(ia2d < closest){
                        closest = ia2d;
                        closestp = interpt;
                        closestj = j;
                    }
                }
                else if(interpt2){
                    interpt = interpt2;
                    var ia2d = interpt.dist(a1);
                    if(ia2d < closest){
                        closest = ia2d;
                        closestp = interpt;
                        closestj = j;
                    }
                }
                if(interpt){
                    pg.fill(255);
                    pg.noStroke();
                    pg.ellipse(interpt.x, interpt.y, 55, 55 );
                }
            }
        }
        
        for(var j = 0; j < qpoly.length; j++){
            if(closestj){
                if(closestj != j)
                    continue;
            }
            var a2 = qpoly[j];
            var b2 = qpoly[(j+1)%qpoly.length];

            var inte = doLinesIntersect(a1, b1, a2, b2);
            if(inte){
                hasinters = true;
                var interpt1 = findLineIntersection(a1, b1, a2, b2);
                var interpt2 = findLineIntersection(a2, b2, a1, b1);
                pg.fill(255);
                pg.noStroke();
                var interpt = -1;
                if(interpt1){
                    interpt = interpt1;
                    pg.ellipse(interpt1.x, interpt1.y, 11, 11);
                }
                if(interpt2){
                    interpt = interpt2;
                    pg.ellipse(interpt2.x, interpt2.y, 11, 11);
                }
                poly.push(a1.copy());
                poly.push(interpt);
                a1 = interpt.copy();
                //poly.push(b2);
                if(poly.length > 2 && issamepoint(b2, firstpoint)){
                    print("aha", poly.length)
                    finished = true;
                    break;
                }
                if(cpolyi){
                    i = (j+0)%qpoly.length;
                    cpoly = poly2;
                    qpoly = poly1;
                    cpolyi = false;
                    break;
                }
                else{
                    i = (j+0)%qpoly.length;
                    cpoly = poly1;
                    qpoly = poly2;
                    cpolyi = true;
                    break;
                }
            }
            //if(inter){
            //    pg.ellipse()
            //}
        }
        if(!hasinters){
            poly.push(a1);
            i++;
        }
    }
    print(poly)
    return poly;
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

function isinside_OLD(point, poly){
    var inside = false;

    var centroid = createVector(0, 0);
    for(var k = 0; k < poly.length; k++){
        var xc = poly[k][0];
        var yc = poly[k][1];
        centroid.x += xc;
        centroid.y += yc;
        pg.fill(255,0,0);
        pg.ellipse(xc, yc, 2+21*k, 2+21*k);
    }
    centroid.div(poly.length);

    for(var k = 0; k < poly.length; k++){
        var p = poly[k];
        var pn = poly[(k+1)%poly.length];
        var wind = windingof(point, p, pn);
    }

    return inside;
}

function drawShapes1(){
    
    const pgw = pg.width;
    const pgh = pg.height;

    pg.push();
    mask.push();
    pg.translate(pgw/2, pgh/2);
    mask.translate(pgw/2, pgh/2);

    pg.colorMode(RGB, 255);
    pg.rectMode(CENTER);

    pg.background(0, 0, 88);

    var cc1 = [random(1), .7, random(.26, .34)]
    if(fxrand() < .5)
        cc1 = [random(1), .7, random(1.-.34, 1.-.26)]
    var c1 = hslToRgb(...cc1);

    var cc2 = [random(1), .7, 1.-cc1[2]]
    var c2 = hslToRgb(...cc2);
    
    var cc3 = [random(1), .7, (cc1[2] + (.5 - cc1[2])*.5)]
    var c3 = hslToRgb(...cc3);
    
    var ccmid12 = [(cc1[0]+cc2[0])*.5, .7, (cc1[2]+cc2[2])*.5]
    var cmid12 = hslToRgb(...ccmid12);
    
    var cc4 = [cc3[0], cc3[1], cc3[2]+.5*(cc2[2]-cc1[2])]
    var c4 = hslToRgb(...cc4);

    var cc5 = [lerp(cc1[0], cc2[0], .35), .7, lerp(ccmid12[2], cc2[2], .3)]
    var c5 = hslToRgb(...cc5);

    //print(getPerceivedLightness([c1.r/255., c1.g/255., c1.b/255.]))
    //print(getPerceivedLightness([c2.r/255., c2.g/255., c2.b/255.]))

    // upper big
    pg.fill(c1.r, c1.g, c1.b);
    pg.rect(0, -pgh/4, pgw, pgh/2);

    // lower big
    pg.fill(c2.r, c2.g, c2.b);
    pg.rect(0, +pgh/4, pgw, pgh/2);
    
    // upper small
    pg.fill(c3.r, c3.g, c3.b);
    pg.ellipse(0, -pgh/3, 111, 111);

    // lower small
    pg.fill(c4.r, c4.g, c4.b);
    pg.ellipse(0, +pgh/3, 111, 111);
    
    // upper right small
    pg.fill(c3.r, c3.g, c3.b);
    //pg.rect(pgw/2-55, -55, 111, 111);

    // lower right small
    pg.fill(c4.r, c4.g, c4.b);
    //pg.rect(pgw/2-55, +55, 111, 111);

    for(var k = 0; k < 12; k++){
        var x = map(power(fxrand(), .5), 0, 1, -pgw/2, pgw/2)*1;
        var y = map(power(fxrand(), .5), 0, 1, -22, 22)*1 + 160;

        var rw = map(power(fxrand(), 4), 0, 1, 16, 16);
        var rh = map(fxrand(), 0, 1, 200, 400);
        pg.push();
        pg.translate(x, y-rh/2);
        pg.rotate(radians(random(-20, 20)));
        pg.noStroke();
        var aar = 20;
        if(fxrand() < .5)
            pg.fill(c4.r+random(-aar,aar), c4.g+random(-aar,aar), c4.b+random(-aar,aar));
        else
            pg.fill(c3.r+random(-aar,aar), c3.g+random(-aar,aar), c3.b+random(-aar,aar));
        pg.rect(0, 0, rw, rh);
        pg.pop();
    }
    
    // middle
    //pg.fill(cmid12.r, cmid12.g, cmid12.b);
    //pg.rect(0, 0, 111, 111);

    pg.pop();
    mask.pop();
}

function map(v, v1, v2, v3, v4){
    return (v-v1)/(v2-v1)*(v4-v3)+v3;
}

function mybox(info){
    x = info[0];
    y = info[1];
    z = info[2];
    wx = info[3];
    wy = info[4];
    wz = info[5];
    rx = info[6];
    ry = info[7];
    rz = info[8];
    ii = info[9];


    mask.fill(ii+1);
    var lineprob = 1.0;

    var raaaa1 = random(-wx/2, wx/2);
    var raaaa2 = random(-wx/2, wx/2);
    
    if(option == 0){
        raaaa1 = random(-0, 0);
        raaaa2 = random(-0, 0);
        lineprob = 1.0;
    }
    if(option == 1){
        raaaa1 = random(-wx/2, wx/2);
        raaaa2 = random(-wx/2, wx/2);
        lineprob = 1.0;
    }
    if(option == 2){
        raaaa1 = random(-0, 0);
        raaaa2 = random(-wx/2, wx/2);
        lineprob = 1.0;
    }
    if(option == 3){
        raaaa1 = random(-wx/2, wx/2);
        raaaa2 = random(-wx/2, wx/2);
        lineprob = 1.0;
    }
    //raaaa1 = 0;
    //raaaa2 = 0;

    pg.push();
    pg.translate(x, y, z);
    pg.rotateX(rx);
    mask.push();
    mask.translate(x, y, z);
    mask.rotateX(rx);
    var stepsa = 2;
    var yyang = radians(floor(random(stepsa-1))*90/stepsa);
    pg.rotateY(yyang);
    mask.rotateY(yyang);
    mask.rotateX(random(-.03, .03));
    mask.rotateY(random(-.03, .03));
    mask.rotateZ(random(-.03, .03));
    //mask.translate(random(-33, 33), random(-33, 33), random(-33, 33));
    //mask.scale(random(.9, .9));

    var rras = floor(fxrand()*palette.length)
    pg.fill(cl2);

    if(infill)
        pg.fill(palette[rras][0]*255., palette[rras][1]*255., palette[rras][2]*255.);

    if(ismono){
        if(flipbw){
            pg.fill(cl3);
        }
        else{
            pg.fill(cl4);
        }
    }
    
    var invs = fxrand() < .5 && hashollow;
    if(ismono)
        invs = false;
    pg.noStroke();
    pg.push();
    mask.push();
    if(!invs || afew){
        pg.box(wx-0.000, wy-0.000, wz-0.000);
        mask.box(wx-0.000, wy-0.000, wz-0.000);
    }
    //pg.translate(0, 0, 0);
    //pg.box(wx-0.000, wy-0.000, wz-0.000);
    //if(ii != 0) pg.translate(raaaa1, 0, 0);
    //pg.fill(cl1);
    if(!invs || afew){
        pg.box(wx-0.000, wy-0.000, wz-0.000);
        mask.box(wx-0.000, wy-0.000, wz-0.000);
    }
    mask.pop();
    pg.pop();


    pg.stroke(cl1);
    var rr = floor(random(6));
    if(rr == 0) pg.stroke(222, 66, 66);
    if(rr == 1) pg.stroke(66, 222, 66);
    if(rr == 2) pg.stroke(66, 66, 222);
    if(rr == 3) pg.stroke(222, 222, 66);
    if(rr == 4) pg.stroke(222, 66, 222);
    if(rr == 5) pg.stroke(66, 222, 222);

    var ridx1 = floor(fxrand()*palette.length)
    pg.stroke(palette[ridx1][0]*255., palette[ridx1][1]*255., palette[ridx1][2]*255.);
    if(ismono){
        if(flipbw){
            pg.stroke(cl4);
        }
        else{
            pg.stroke(cl3);
        }
    }
    pg.noFill();
    pg.push();
    if(raaaa2 != 0.0) pg.strokeWeight(5);
    //pg.translate(raaaa2, 0, 0);
    if(!ismono) pg.stroke(palette[ridx1][0]*255., palette[ridx1][1]*255., palette[ridx1][2]*255.);
    pg.box(wx-0.000, wy-0.000, wz-0.000);
    pg.pop();

    if(fxrand() < lineprob && !invs || afew){
        lines(
            createVector(+wx/2, -wy/2, -wz/2),
            createVector(+wx/2, -wy/2, +wz/2),
            createVector(+wx/2, +wy/2, +wz/2),
            createVector(+wx/2, +wy/2, -wz/2),
            [palette[ridx1][0]*255., palette[ridx1][1]*255., palette[ridx1][2]*255.],    
        );

        lines(
            createVector(-wx/2, -wy/2, -wz/2),
            createVector(-wx/2, -wy/2, +wz/2),
            createVector(-wx/2, +wy/2, +wz/2),
            createVector(-wx/2, +wy/2, -wz/2),
            [palette[ridx1][0]*255., palette[ridx1][1]*255., palette[ridx1][2]*255.],    
        );
        
        lines(
            createVector(-wx/2, +wy/2, -wz/2),
            createVector(-wx/2, +wy/2, +wz/2),
            createVector(+wx/2, +wy/2, +wz/2),
            createVector(+wx/2, +wy/2, -wz/2),
            [palette[ridx1][0]*255., palette[ridx1][1]*255., palette[ridx1][2]*255.],    
        );

        lines(
            createVector(-wx/2, -wy/2, -wz/2),
            createVector(-wx/2, -wy/2, +wz/2),
            createVector(+wx/2, -wy/2, +wz/2),
            createVector(+wx/2, -wy/2, -wz/2),
            [palette[ridx1][0]*255., palette[ridx1][1]*255., palette[ridx1][2]*255.],    
        );
        
        lines(
            createVector(-wx/2, -wy/2, +wz/2),
            createVector(+wx/2, -wy/2, +wz/2),
            createVector(+wx/2, +wy/2, +wz/2),
            createVector(-wx/2, +wy/2, +wz/2),
            [palette[ridx1][0]*255., palette[ridx1][1]*255., palette[ridx1][2]*255.],    
        );

        lines(
            createVector(-wx/2, -wy/2, -wz/2),
            createVector(+wx/2, -wy/2, -wz/2),
            createVector(+wx/2, +wy/2, -wz/2),
            createVector(-wx/2, +wy/2, -wz/2),
            [palette[ridx1][0]*255., palette[ridx1][1]*255., palette[ridx1][2]*255.],    
        );
    }


    pg.pop();
    mask.pop();
}


function lines(p1, p2, p3, p4, col){

    var det = random(detmin, detmax);
    if(uniform)
        det = detu;
    //if(ismono)
    //    det = 8;
    var parts = 1 + round(p1.dist(p2) / det);

    for(var pa = 0; pa < parts; pa++){
        var p = map(pa, 0, parts-1, 0, 1);
        if(haswarp)
            p = power(p, waa);

        if(!isFinite(p)){
            p = fxrand();
        }
        
        var x1 = lerp(p1.x, p2.x, p);
        var y1 = lerp(p1.y, p2.y, p);
        var z1 = lerp(p1.z, p2.z, p);
        var x2 = lerp(p4.x, p3.x, p);
        var y2 = lerp(p4.y, p3.y, p);
        var z2 = lerp(p4.z, p3.z, p);

        var col2 = [col[0], col[1], col[2]];
        pg.stroke(
            min(255, max(0, col2[0]*random(.88, 1.12))),
            min(255, max(0, col2[1]*random(.88, 1.12))), 
            min(255, max(0, col2[2]*random(.88, 1.12))),
        )

        if(infill){
            pg.stroke(
                min(255, max(0, col2[0]*random(.88, 1.12))),
                min(255, max(0, col2[1]*random(.88, 1.12))), 
                min(255, max(0, col2[2]*random(.88, 1.12))),
            )
        }

        if(ismono){
            if(flipbw){
                pg.stroke(cl4);
            }
            else{
                pg.stroke(cl3);
            }
        }

        pg.line(x1, y1, z1, x2, y2, z2);
        pg.push();
        //pg.stroke(cl2);
        pg.strokeWeight(2);
        //pg.line(x1, y1, z1, x2, y2, z2);
        pg.pop();
    }
    if(random(10) < 5 && hasparallels)
        return;
    if(!uniform && fxrand() <  .5){
        det = random(detmin, detmax);
    }
    //if(ismono)
    //    det = 8;
    parts = 1 + round(p1.dist(p4) / det);
    for(var pa = 0; pa < parts; pa++){
        var p = map(pa, 0, parts-1, 0, 1);
        if(haswarp)
            p = power(p, waa);
        if(!isFinite(p)){
            p = fxrand();
        }
        var x1 = lerp(p1.x, p4.x, p);
        var y1 = lerp(p1.y, p4.y, p);
        var z1 = lerp(p1.z, p4.z, p);
        var x2 = lerp(p2.x, p3.x, p);
        var y2 = lerp(p2.y, p3.y, p);
        var z2 = lerp(p2.z, p3.z, p);
        pg.line(x1, y1, z1, x2, y2, z2);
        pg.push();
        pg.stroke(cl2);
        pg.strokeWeight(2);
        //pg.line(x1, y1, z1, x2, y2, z2);
        pg.pop();
    }
}

function getStroke(x0, y0, x1, y1, w0, w1, seed, raise0=1, detail0=1, nzamp0=1){
    var strokepoints = [];
    var d = dist(x0, y0, x1, y1);
    var detail = 1*detail0;
    var parts = round(d/detail);
    var nzamp = nzamp0*.25;
    var nzfrq = .12;
    var raise = raise0*(.5 + fxrand()*.2);

    var p0 = createVector(x0, y0);
    var p1 = createVector(x1, y1);
    var v01 = p5.Vector.sub(p1, p0);
    v01.normalize();
    var pe = v01.copy();
    pe.rotate(-PI/2);

    var t0 = p5.Vector.add(p0, p5.Vector.mult(pe, +w0/2))
    var t1 = p5.Vector.add(p1, p5.Vector.mult(pe, +w1/2))
    var t2 = p5.Vector.add(p1, p5.Vector.mult(pe, -w1/2))
    var t3 = p5.Vector.add(p0, p5.Vector.mult(pe, -w0/2))
    var dd, dparts;
    
    dd = dist(t0.x, t0.y, t1.x, t1.y);
    dparts = 2 + round(dd/detail);
    for(var part = 0; part < dparts; part++){
        var p = map(part, 0, dparts, 0, 1);
        var x = lerp(t0.x, t1.x, p) + (w0+w1)/2*nzamp * (-.5 + power(noise(strokepoints.length*nzfrq, seed), 6));
        var y = lerp(t0.y, t1.y, p) + (w0+w1)/2*nzamp * (-.5 + power(noise(strokepoints.length*nzfrq+2113.13, seed), 6));
        strokepoints.push([x, y, 0]);
    }
    
    dd = dist(t1.x, t1.y, t2.x, t2.y);
    dparts = 2 + round(dd/detail);
    for(var part = 0; part < dparts; part++){
        var p = map(part, 0, dparts, 0, 1);
        var arc = p5.Vector.mult(v01, (w0+w1)/2*raise*sin(p*3.141));
        var x = lerp(t1.x, t2.x, p) + arc.x + (w0+w1)/2*nzamp * (-.5 + power(noise(strokepoints.length*nzfrq, seed), 3));
        var y = lerp(t1.y, t2.y, p) + arc.y + (w0+w1)/2*nzamp * (-.5 + power(noise(strokepoints.length*nzfrq+2113.13, seed), 3));
        strokepoints.push([x, y, 0]);
    }
    
    dd = dist(t2.x, t2.y, t3.x, t3.y);
    dparts = 2 + round(dd/detail);
    for(var part = 0; part < dparts; part++){
        var p = map(part, 0, dparts, 0, 1);
        var x = lerp(t2.x, t3.x, p) + (w0+w1)/2*nzamp * (-.5 + power(noise(strokepoints.length*nzfrq, seed), 3));
        var y = lerp(t2.y, t3.y, p) + (w0+w1)/2*nzamp * (-.5 + power(noise(strokepoints.length*nzfrq+2113.13, seed), 3));
        strokepoints.push([x, y, 0]);
    }
    
    dd = dist(t3.x, t3.y, t0.x, t0.y);
    dparts = 2 + round(dd/detail);
    for(var part = 0; part < dparts; part++){
        var p = map(part, 0, dparts, 0, 1);
        var arc = p5.Vector.mult(v01, -(w0+w1)/2*raise*sin(p*3.141));
        var x = lerp(t3.x, t0.x, p) + arc.x + (w0+w1)/2*nzamp * (-.5 + power(noise(strokepoints.length*nzfrq, seed), 3));
        var y = lerp(t3.y, t0.y, p) + arc.y + (w0+w1)/2*nzamp * (-.5 + power(noise(strokepoints.length*nzfrq+2113.13, seed), 3));
        strokepoints.push([x, y, 0]);
    }

    return strokepoints;
}

function getThings(x0, y0, x1, y1, w0, w1, seed, anchorprobleft, anchorprobright, tilt){
    var allthings = [];
    var nthings = 3 + fxrand()*6;

    var anchors = [];
    for(var k = 0; k < nthings/2; k++){
        var p = fxrand()*.5;
        var thth = 3 + fxrand()*5;
        var lx = lerp(x0, x1, p);
        var ly = lerp(y0, y1, p);
        var thingpointsl = getStroke(lx, ly, lx, ly-10, thth, thth, fxrand()*10000);
        var rx = lerp(x0, x1, 1-p);
        var ry = lerp(y0, y1, 1-p);
        var thingpointsr = getStroke(rx, ry, rx, ry-10, thth, thth, fxrand()*10000);
        allthings.push(thingpointsl);
        allthings.push(thingpointsr);

        var hasloose = 1 * (p > .4) * 0;
        if(thth < 5){
            var thingpointsl2 = getStroke(lx, ly-10, lx, ly-20, thth*1.7, thth*1.7, fxrand()*10000, 0.1);
            var thingpointsr2 = getStroke(rx, ry-10, rx, ry-20, thth*1.7, thth*1.7, fxrand()*10000, 0.1);
            allthings.push(thingpointsl2);
            allthings.push(thingpointsr2);
            if(fxrand()<anchorprobleft){
                anchors.push([lx, ly-20, hasloose]);
                anchors.push([rx, ry-20, hasloose]);
            }
        }
        else{
            if(fxrand()<anchorprobright){
                anchors.push([lx, ly-10, hasloose]);
                anchors.push([rx, ry-10, hasloose]);
            }
        }

    }
    if(fxrand() < .13){
        anchors.push([(x0+x1)/2, (y0+y1)/2, 1]);
        if(fxrand() < .5) anchors.push([(x0+x1)/2, (y0+y1)/2, 1]);
    }
    return {'allthings': allthings, 'anchors': anchors}
}

function shuffle(array) {
    let currentIndex = array.length
    var randomIndex;

  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(fxrand() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [r, g, b]
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
    blurH.setUniform('seed', (globalseed*.12134)%33.);
    blurpass1.shader(blurH);
    blurpass1.quad(-1,-1,1,-1,1,1,-1,1);
    
    blurV.setUniform('tex0', blurpass1);
    blurH.setUniform('tex1', mask);
    blurV.setUniform('texelSize', [1.0/resx, 1.0/resy]);
    blurV.setUniform('direction', [-dir[1], [0]]);
    blurV.setUniform('u_time', frameCount*0+globalseed*.01);
    blurV.setUniform('amp', .03);
    blurV.setUniform('seed', (globalseed*.12134)%33.);
    blurpass2.shader(blurV);
    blurpass2.quad(-1,-1,1,-1,1,1,-1,1);

    effect.setUniform('tex0', blurpass2);
    effect.setUniform('tex1', pg);
    effect.setUniform('tex2', mask);
    effect.setUniform('tex3', bgpg);
    effect.setUniform('u_usemask', usemask*1.);
    effect.setUniform('u_resolution', [resx, resy]);
    effect.setUniform('u_mouse',[dir[0], [1]]);
    effect.setUniform('u_time', frameCount);
    effect.setUniform('incolor', [map(fxrand(), 0, 1, .99, 1.), map(fxrand(), 0, 1, .99, 1.), .99, 1.]);
    effect.setUniform('seed', globalseed);
    effect.setUniform('noiseamp', mouseX/width*0+1);
    effect.setUniform('hasmargin', hasmargin);
    //effect.setUniform('tintColor', HSVtoRGB(fxrand(), 0.2, 0.95));
    var hue1 = fxrand();
   //effect.setUniform('tintColor', HSVtoRGB(fxrand(),.3,.9));
    //effect.setUniform('tintColor2', HSVtoRGB((hue1+.45+fxrand()*.1)%1,.3,.9));
    var ridx1 = floor(fxrand()*palette.length)
    var ridx2 = floor(fxrand()*palette.length)
    effect.setUniform('tintColor', palette[ridx1]);
    effect.setUniform('tintColor2', palette[ridx2]);
    effectpass.shader(effect);
    effectpass.quad(-1,-1,1,-1,1,1,-1,1);
  
    // draw the second pass to the screen
    //image(effectpass, 0, 0, mm-18, mm-18);
    var xx = 0;
    image(effectpass, 0, 0, mm*resx/resy-xx, mm-xx);

}



function draw(){
    /*let bins = fft.analyze();
    binsum = 0;
    for (let i = bins.length-10; i < bins.length; i++) {
        let val = bins[i];
        if(val>3 && timer < 0){
            binsum += val;
        }
    }
    if(binsum>50){
        generateHeads();
        timer = frameRate();
    }
    timer--;*/
    
/*effect.setUniform('u_tex', pg);
    effect.setUniform('u_resolution', [width, height]);
    effect.setUniform('u_mouse', [width, height]);
    effect.setUniform('u_time', frameCount);

    shader(effect);
    fill(255);
    quad(-1,-1,1,-1,1,1,-1,1);*/
    
    //vectorizeHeads();

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