/**
 * Program Name: p5_audio_visualizer
 * Description: 這是一個結合 p5.js 與 p5.sound 的程式，載入音樂並循環播放，畫面上會有多個隨機生成的多邊形在視窗內移動反彈，且其大小會跟隨音樂的振幅（音量）即時縮放。
 */

// 全域變數定義
let shapes = [];      // 用來儲存畫面上所有多邊形物件的陣列
let song;             // 儲存載入的音樂檔案
let amplitude;        // p5.Amplitude 物件，用來解析音樂的音量振幅
let bodyPoints = [    // 蟑螂身體輪廓 (橢圓形略尖)
  [0, -12], [5, -8], [6, 0], [5, 10], [0, 16], [-5, 10], [-6, 0], [-5, -8]
];

let legLines = [      // 蟑螂的腳與觸鬚 (線條路徑，讓細節更清楚)
  [[2, -12], [5, -25], [12, -32]],    // 右觸鬚
  [[-2, -12], [-5, -25], [-12, -32]], // 左觸鬚
  [[5, -8], [12, -12], [16, -10]],    // 右前腳
  [[-5, -8], [-12, -12], [-16, -10]], // 左前腳
  [[6, 0], [14, -2], [18, 4]],        // 右中腳
  [[-6, 0], [-14, -2], [-18, 4]],     // 左中腳
  [[5, 10], [14, 14], [18, 22]],      // 右後腳
  [[-5, 10], [-14, 14], [-18, 22]]    // 左後腳
];

function preload() {
  // Purpose: 在程式開始前預載入外部音樂資源
  // Logic: 使用 loadSound() 載入音檔
  // 請確保專案目錄下有 'midnight-quirk-255361.mp3' 這個檔案
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // Purpose: 初始化畫布、音樂播放狀態與生成多邊形物件
  
  // Logic: 使用 createCanvas(windowWidth, windowHeight) 建立符合視窗大小的畫布
  createCanvas(windowWidth, windowHeight);

  // Logic: 將變數 amplitude 初始化為 new p5.Amplitude()
  amplitude = new p5.Amplitude();

  // Logic: 使用 for 迴圈產生 10 個形狀物件，並 push 到 shapes 陣列中
  for (let i = 0; i < 10; i++) {
    let s = random(2, 4); // 設定這隻蟑螂的大小比例
    let shape = {
      // 0 到 windowWidth 之間的隨機亂數（初始 X 座標）
      x: random(0, windowWidth),
      
      // 0 到 windowHeight 之間的隨機亂數（初始 Y 座標）
      y: random(0, windowHeight),
      
      // -3 到 3 之間的隨機亂數（X 軸水平移動速度）
      dx: random(-3, 3),
      
      // -3 到 3 之間的隨機亂數（Y 軸垂直移動速度）
      dy: random(-3, 3),
      
      // 1 到 10 之間的隨機亂數（縮放比例）
      scale: random(1, 10),
      
      // 隨機生成的深褐色系 (讓它看起來更像蟑螂)
      color: color(random(40, 80), random(10, 40), random(0, 20)),
      
      // 分別處理身體與腳的縮放
      body: bodyPoints.map(p => ({x: p[0] * s, y: p[1] * s})),
      legs: legLines.map(leg => leg.map(p => ({x: p[0] * s, y: p[1] * s})))
    };
    
    shapes.push(shape);
  }
}

function draw() {
  // Purpose: 每幀重複執行，處理背景更新、抓取音量與繪製動態圖形
  
  // Logic: 設定背景顏色為 '#ffcdb2'
  background('#ffcdb2');
  
  // Logic: 設定邊框粗細 strokeWeight(2)
  strokeWeight(2);

  // Logic: 透過 amplitude.getLevel() 取得當前音量大小（數值介於 0 到 1），存入變數 level
  let level = amplitude.getLevel();

  // Logic: 使用 map() 函式將 level 從 (0, 1) 的範圍映射到 (0.5, 2) 的範圍，並存入變數 sizeFactor
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // Logic: 使用 for...of 迴圈走訪 shapes 陣列中的每個 shape 進行更新與繪製
  for (let shape of shapes) {
    
    // --- 位置更新 ---
    shape.x += shape.dx;
    shape.y += shape.dy;

    // --- 邊緣反彈檢查 ---
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    // --- 設定外觀 ---
    fill(shape.color);
    stroke(shape.color);

    // --- 座標轉換與縮放 ---
    push();
    translate(shape.x, shape.y); // 將原點移動到形狀座標
    scale(sizeFactor);           // 依照音樂音量縮放圖形

    // --- 繪製腳與觸鬚 (細線) ---
    noFill();
    strokeWeight(1.5);
    for (let leg of shape.legs) {
      beginShape();
      for (let p of leg) vertex(p.x, p.y);
      endShape();
    }

    // --- 繪製身體 (實心) ---
    fill(shape.color);
    strokeWeight(2);
    beginShape();
    for (let p of shape.body) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);

    // --- 狀態還原 ---
    pop();
  }
  
  // 繪製藍白拖跟隨滑鼠
  drawSlipper(mouseX, mouseY);

  // 輔助功能：若音樂未播放，顯示提示文字
  if (!song.isPlaying()) {
    fill(0);
    noStroke();
    textAlign(CENTER);
    textSize(20);
    text('Click screen to play music', width / 2, height / 2);
  }
}

// 視窗大小改變時調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 點擊滑鼠控制播放（處理瀏覽器 Autoplay Policy）
function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop(); // 根據描述：載入音樂並"循環播放"
  }
}

// 繪製藍白拖函式
function drawSlipper(x, y) {
  push();
  translate(x, y);
  rotate(-0.2); // 稍微傾斜，讓它看起來比較自然

  // 陰影 (讓拖鞋有立體感)
  noStroke();
  fill(0, 0, 0, 50);
  rectMode(CENTER);
  rect(5, 5, 60, 110, 30);

  // 鞋底 (藍色)
  fill(0, 50, 200);
  rect(0, 0, 60, 110, 30);

  // 鞋面 (白色)
  fill(255);
  rect(0, -2, 54, 104, 27);

  // 鞋帶 (藍色寬帶)
  fill(0, 50, 200);
  arc(0, -20, 54, 60, PI, TWO_PI, CHORD);
  
  pop();
}