const imageInput = document.getElementById("imageInput");
const textInput = document.getElementById("textInput");
const saveButton = document.getElementById("saveButton");
const scaleSlider = document.getElementById("scaleSlider");
const bgColorPicker = document.getElementById("bgColorPicker");
const bubbleCountSelect = document.getElementById("bubbleCount");
const bubbleInputs = document.getElementById("bubbleInputs");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 540;

let uploadedImage = null;

// 吹き出し画像
const bubbleImages = {
  red: new Image(),
  blue: new Image(),
  yellow: new Image(),
  green: new Image()
};
bubbleImages.red.src = "hukidasi_aka.png";
bubbleImages.blue.src = "hukidasi_ao.png";
bubbleImages.yellow.src = "hukidasi_kiiro.png";
bubbleImages.green.src = "hukidasi_midori.png";

// 吹き出し切替
bubbleCountSelect.addEventListener("change", () => {
  const count = parseInt(bubbleCountSelect.value);
  for (let i = 1; i <= 4; i++) {
    const label = bubbleInputs.querySelectorAll("label")[i - 1];
    const input = document.getElementById(`bubbleText${i}`);
    if (i <= count) {
      label.style.display = "block";
      input.style.display = "block";
    } else {
      label.style.display = "none";
      input.style.display = "none";
    }
  }
  draw();
});

// イベントリスナ
imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      uploadedImage = img;
      draw();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});
textInput.addEventListener("input", draw);
scaleSlider.addEventListener("input", () => {
  draw();
  document.getElementById("scaleValue").textContent =
    `現在の画像サイズ：${Math.round(scaleSlider.value * 100)}%`;
});
bgColorPicker.addEventListener("input", () => {
  bgColorPicker.style.backgroundColor = bgColorPicker.value;
  draw();
});
document.querySelectorAll("input[type=checkbox]").forEach(c => c.addEventListener("change", draw));

saveButton.addEventListener("click", function () {
  const link = document.createElement("a");
  link.download = "reaction_thumbnail.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

function draw() {
  const useRays = document.getElementById("raysToggle").checked;
  const stretchText = document.getElementById("stretchText").checked;
  const shadowText = document.getElementById("shadowToggle").checked;
  const scale = parseFloat(scaleSlider.value);
  const bgColor = bgColorPicker.value;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (useRays) drawRays();

  if (uploadedImage) {
    const imgRatio = uploadedImage.width / uploadedImage.height;
    const baseWidth = canvas.width * scale;
    const baseHeight = baseWidth / imgRatio;
    const offsetX = (canvas.width - baseWidth) / 2;
    const offsetY = (canvas.height - baseHeight) / 2;
    ctx.drawImage(uploadedImage, offsetX, offsetY, baseWidth, baseHeight);
  }

  const text = textInput.value;
  if (text) {
    const fontName = "sans-serif";
    let fontSize = canvas.height * 0.22;
    if (!stretchText) {
      ctx.font = `bold ${fontSize}px ${fontName}`;
      let measured = ctx.measureText(text).width;
      while (measured > canvas.width * 0.9 && fontSize > 10) {
        fontSize -= 1;
        ctx.font = `bold ${fontSize}px ${fontName}`;
        measured = ctx.measureText(text).width;
      }
      ctx.textAlign = "center";
    } else {
      ctx.font = `bold ${fontSize}px ${fontName}`;
      const baseWidth = ctx.measureText(text).width;
      const scaleX = Math.min(1.5, canvas.width * 0.9 / baseWidth);
      ctx.setTransform(scaleX, 0, 0, 1, canvas.width / 2 * (1 - scaleX), 0);
      ctx.textAlign = "center";
    }

    ctx.textBaseline = "bottom";
    ctx.fillStyle = "red";
    ctx.strokeStyle = "white";
    ctx.lineWidth = fontSize * 0.1;
    ctx.shadowColor = shadowText ? "black" : "transparent";
    ctx.shadowOffsetX = shadowText ? 4 : 0;
    ctx.shadowOffsetY = shadowText ? 4 : 0;
    ctx.shadowBlur = shadowText ? 6 : 0;

    const x = canvas.width / 2;
    const y = canvas.height;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    if (stretchText) ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // 吹き出し描画
  const bubbleCount = parseInt(bubbleCountSelect.value);
  const bubbleKeys = ["red", "blue", "yellow", "green"];
  const bubblePositions = [
    { x: 50, y: 50 },
    { x: canvas.width - 250, y: 50 },
    { x: 50, y: canvas.height - 150 },
    { x: canvas.width - 250, y: canvas.height - 150 }
  ];

  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < bubbleCount; i++) {
    const t = document.getElementById(`bubbleText${i + 1}`).value;
    if (t.trim() === "") continue;
    const { x, y } = bubblePositions[i];
    const img = bubbleImages[bubbleKeys[i]];
    ctx.drawImage(img, x, y, 200, 100);
    ctx.fillStyle = "#000";
    ctx.fillText(t, x + 100, y + 50);
  }
}

function drawRays() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const rays = 60;
  const angleStep = (Math.PI * 2) / rays;
  for (let i = 0; i < rays; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const angle = i * angleStep;
    const x = cx + Math.cos(angle) * canvas.width;
    const y = cy + Math.sin(angle) * canvas.height;
    ctx.lineTo(x, y);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 60;
    ctx.stroke();
  }
}
