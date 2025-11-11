let table;
let worldMap;
let volcanoes = [];
let hovered = null;


const colors = {
  darkRed: "#8B0909",
  orange: "#B20808",
  pink: "#EDD9CC",
  khaki: "#B8A597",
  coyote: "#806350"
};


const lonOffset =-15.0;   
const latOffset =-9.0;   
const lonScale  = 0.85;   
const latScale  = 1.33; 
const xShift    = 0;     
const yShift    = 0;    

function preload() {
  table = loadTable('data.csv', 'csv');
  worldMap = loadImage('world-map-light.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Helvetica, Arial, sans-serif');
  textAlign(LEFT, TOP);
  noStroke();

  for (let r = 0; r < table.getRowCount(); r++) {
    let row = table.getRow(r);
    let name = row.getString(1);
    let country = row.getString(2);
    let lat = float(row.getString(4));
    let lon = float(row.getString(5));
    let elev = float(row.getString(6));
    let type = row.getString(7);
    let activity = row.getString(10);

    let c;
    if (type.includes('Strato')) c = colors.darkRed;
    else if (type.includes('Shield')) c = colors.orange;
    else if (type.includes('Caldera')) c = colors.khaki;
    else if (type.includes('Cone')) c = colors.coyote;
    else c = colors.pink;

    let size = map(elev, 0, 4000, 4, 18);
    volcanoes.push({ name, country, lat, lon, size, c, elev, type, activity });
  }
}

function draw() {
  drawGradientBackground();

  let mapRatio = worldMap.width / worldMap.height;
  let canvasRatio = width / height;
  let mapWidth, mapHeight, offsetX = 0, offsetY = 0;

  if (canvasRatio > mapRatio) {
    mapHeight = height;
    mapWidth = mapHeight * mapRatio;
    offsetX = (width - mapWidth) / 2;
  } else {
    mapWidth = width;
    mapHeight = mapWidth / mapRatio;
    offsetY = (height - mapHeight) / 2;
  }

  image(worldMap, offsetX, offsetY, mapWidth, mapHeight);
  fill(255, 220);
  rect(0, 0, width, height);

  fill('#111');
  textSize(28);
  textStyle(BOLD);
  text("World Volcanoes Overview", 40, 30);
  textSize(14);
  textStyle(NORMAL);
  fill('#555');
  text("Data visualization — interactive glifo view", 40, 65);

  hovered = null;

  for (let v of volcanoes) {
    let adjLon = (v.lon + lonOffset) * lonScale;
    let adjLat = (v.lat + latOffset) * latScale;

    let x = map(adjLon, -180, 180, offsetX, offsetX + mapWidth);
    let y = offsetY + latToY(adjLat, mapHeight);

    x += xShift;
    y += yShift;

    let d = dist(mouseX, mouseY, x, y);
    if (d < v.size / 2) hovered = { ...v, x, y };

    noStroke();
    fill(v.c);
    ellipse(x, y, v.size);
  }

  drawLegend();

  if (hovered) drawTooltip(hovered);
}

function latToY(lat, mapHeight) {
  lat = constrain(lat, -85.05112878, 85.05112878);
  let latRad = radians(lat);
  let mercN = log(tan(PI / 4 + latRad / 2));
  return mapHeight / 2 - (mapHeight * mercN) / (2 * PI);
}
function drawGradientBackground() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color('#F3F7FA'), color('#E7F0F6'), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawLegend() {
  let x0 = width - 220;
  let y0 = height - 170;

  fill(255, 240);
  stroke('#DDD');
  rect(x0 - 20, y0 - 20, 200, 150, 12);
  noStroke();

  textSize(14);
  fill('#111');
  textStyle(BOLD);
  text("Legend", x0, y0);

  let items = [
    { label: "Stratovolcano", col: colors.darkRed },
    { label: "Shield volcano", col: colors.orange },
    { label: "Caldera", col: colors.khaki },
    { label: "Cone", col: colors.coyote },
    { label: "Other", col: colors.pink }
  ];

  textStyle(NORMAL);
  for (let i = 0; i < items.length; i++) {
    fill(items[i].col);
    ellipse(x0 + 10, y0 + 25 + i * 22, 10);
    fill('#333');
    text(items[i].label, x0 + 25, y0 + 18 + i * 22);
  }
}


function drawTooltip(v) {
  let boxW = 260;
  let boxH = 100;
  let px = mouseX + 15;
  let py = mouseY + 15;
  if (px + boxW > width) px = mouseX - boxW - 15;
  if (py + boxH > height) py = mouseY - boxH - 15;

  fill(255, 245);
  stroke('#CCC');
  rect(px, py, boxW, boxH, 10);
  noStroke();
  fill('#111');
  textSize(13);
  textStyle(BOLD);
  text(v.name, px + 12, py + 10);
  textStyle(NORMAL);
  fill('#444');
  textSize(12);
  text(`Country: ${v.country}\nType: ${v.type}\nElevation: ${v.elev} m\nActivity: ${v.activity}`, px + 12, py + 32);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
