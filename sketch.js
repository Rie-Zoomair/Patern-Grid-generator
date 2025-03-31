let gridDensity = 10;
let gutter = 0;
let blankChance = 25;

let selectedShapes = ["square"];
let selectedComplexityLevels = [1];

let gridDensityX, gridDensityY;
let shapes = [];
let canvas;
let canvasWidth = 600;
let canvasHeight = 600;

function setup() {
  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("canvasContainer");

  updateGridFromDensity();
  generateRandomPattern();

  select("#gridSlider").input(() => {
    gridDensity = int(select("#gridSlider").value());
    updateGridFromDensity();
    generateRandomPattern();
  });

  select("#gutterSlider").input(() => {
    gutter = select("#gutterSlider").value();
    generateRandomPattern();
  });

  select("#blankChanceSlider").input(() => {
    blankChance = int(select("#blankChanceSlider").value());
    generateRandomPattern();
  });

  updateVariantButtonsAvailability();
}

function updateGridFromDensity() {
  gridSize = (width - (gridDensity - 1) * gutter) / gridDensity;
  gridDensityX = gridDensityY = gridDensity;
}

function draw() {
  clear();
  drawGrid();
}

function toggleShape(shape) {
  const index = selectedShapes.indexOf(shape);
  if (index > -1) {
    selectedShapes.splice(index, 1);
  } else {
    selectedShapes.push(shape);
  }

  document.querySelectorAll(".top-button-row button").forEach((btn) => {
    const label = btn.textContent.toLowerCase();
    btn.classList.toggle("active", selectedShapes.includes(label));
  });

  updateVariantButtonsAvailability();
  generateRandomPattern();
}

function toggleVariant(level) {
  const index = selectedComplexityLevels.indexOf(level);
  if (index > -1) {
    selectedComplexityLevels.splice(index, 1);
  } else {
    selectedComplexityLevels.push(level);
  }

  document.querySelectorAll("#variantButtons button").forEach((btn, idx) => {
    const lvl = idx + 1;
    btn.classList.toggle("active", selectedComplexityLevels.includes(lvl));
  });

  generateRandomPattern();
}

  function updateVariantButtonsAvailability() {
  const maxVariants = getMaxVariantsForCurrentShapes();

  // Merke vorher, welche aktiv waren
  const currentActive = selectedComplexityLevels.slice();

  selectedComplexityLevels = [];

  document.querySelectorAll("#variantButtons button").forEach((btn, idx) => {
    const variant = idx + 1;
    const isAllowed = variant <= maxVariants;

    btn.disabled = !isAllowed;
    btn.style.opacity = isAllowed ? 1 : 0.3;

    if (isAllowed) {
      if (currentActive.includes(variant)) {
        selectedComplexityLevels.push(variant);
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    } else {
      btn.classList.remove("active");
    }
  });

  // Falls alle alten Varianten weggefallen sind, aktiviere 1
  if (selectedComplexityLevels.length === 0 && maxVariants >= 1) {
    selectedComplexityLevels = [1];
    const btn = document.querySelectorAll("#variantButtons button")[0];
    btn.classList.add("active");
    btn.disabled = false;
    btn.style.opacity = 1;
  }
}


function getMaxVariantsForCurrentShapes() {
  if (selectedShapes.includes("square")) return 4;
  if (selectedShapes.includes("triangle")) return 2;
  if (selectedShapes.includes("circle")) return 2;
  if (selectedShapes.includes("abstract")) return 2;
  return 1;
}

function generateRandomPattern() {
  shapes = [];
  let totalCellSize = gridSize + gutter;
  let offsetX = (width - totalCellSize * gridDensityX + gutter) / 2;
  let offsetY = (height - totalCellSize * gridDensityY + gutter) / 2;

  for (let i = 0; i < gridDensityX; i++) {
    for (let j = 0; j < gridDensityY; j++) {
      let rotationIndex = floor(random(4));
      let isVisible = random(100) >= blankChance;
      let shapeType = random(selectedShapes);
      let complexity = floor(random(selectedComplexityLevels));

      let maxVariants = 1;
      if (shapeType === "square") maxVariants = 4;
      else if (shapeType === "triangle" || shapeType === "circle") maxVariants = 2;
      else if (shapeType === "abstract") maxVariants = 2;

      if (complexity > maxVariants) {
        complexity = maxVariants;
      }

      shapes.push({
        x: offsetX + i * totalCellSize,
        y: offsetY + j * totalCellSize,
        size: gridSize,
        rotationIndex,
        visible: isVisible,
        shapeType,
        complexity,
      });
    }
  }
}

function drawGrid() {
  noStroke();
  fill(0);

  for (let shape of shapes) {
    if (!shape.visible) continue;

    push();
    let cx = shape.x + shape.size / 2;
    let cy = shape.y + shape.size / 2;
    translate(cx, cy);

    let d = dist(mouseX, mouseY, cx, cy);
    let isHovered = d < shape.size / 2;

    let baseRotation = shape.rotationIndex * HALF_PI;
    let hoverRotation = isHovered ? PI / 200 : 0;
    rotate(baseRotation + hoverRotation);

    let scaleFactor = isHovered ? 0.95 : 1;
    scale(scaleFactor);

    drawShape(shape.shapeType, shape.size, shape.complexity);
    pop();
  }
}

function drawShape(type, size, complexity = 1) {
  if (type === "square") {
    drawSquareVariant(complexity, size);
  } else if (type === "triangle") {
    drawTriangleVariant(complexity, size);
  } else if (type === "abstract") {
    drawCustomSVGShape1(size, complexity);
  } else if (type === "circle") {
    drawCircleVariant(complexity, size);
  }
}

function drawSquareVariant(level, size) {
  rectMode(CENTER);
  if (level === 1) {
    rect(0, 0, size, size);
  } else if (level === 2) {
    for (let i = -1; i <= 1; i++) {
      rect(i * size * 0.3, 0, size * 0.2, size);
    }
  } else if (level === 3) {
    rotate(PI / 4);
    rect(0, 0, size * 0.7, size * 0.7);
  } else if (level === 4) {
    for (let i = -3; i <= 3; i++) {
      rect(i * size * 0.15, 0, size * 0.08, size);
    }
  }
}

function drawTriangleVariant(level, size) {
  if (level === 1) {
    triangle(-size / 2, -size / 2, size / 2, size / 2, -size / 2, size / 2);
  } else if (level === 2) {
    triangle(-size / 2, size / 2, 0, -size / 2, size / 2, size / 2);
  }
}

function drawCircleVariant(level, size) {
  ellipseMode(CENTER);
  if (level === 1) {
    ellipse(0, 0, size, size);
  } else if (level === 2) {
    arc(0, 0, size, size, PI, TWO_PI, PIE);
  }
}

function drawCustomSVGShape1(size, level = 1) {
  if (level === 1) {
    beginShape();
    vertex(-size * 0.5, -size * 0.5);
    bezierVertex(
      -size * 0.5,
      size * 0.3,
      size * 0.5,
      -size * 0.3,
      size * 0.5,
      size * 0.5
    );
    vertex(-size * 0.5, size * 0.5);
    endShape(CLOSE);
  } else if (level === 2) {
    noFill();
    stroke(0);
    strokeWeight(2);
    let r = size / 2;
    arc(-r, -r, size, size, 0, HALF_PI);
    arc(r, r, size, size, PI, PI + HALF_PI);
  }
}
function drawShapeOnGraphics(pg, type, size, complexity = 1) {
  if (type === "square") {
    if (complexity === 1) {
      pg.rect(0, 0, size, size);
    } else if (complexity === 2) {
      for (let i = -1; i <= 1; i++) {
        pg.rect(i * size * 0.3, 0, size * 0.2, size);
      }
    } else if (complexity === 3) {
      pg.rotate(PI / 4);
      pg.rect(0, 0, size * 0.7, size * 0.7);
    } else if (complexity === 4) {
      for (let i = -3; i <= 3; i++) {
        pg.rect(i * size * 0.15, 0, size * 0.08, size);
      }
    }
  } else if (type === "triangle") {
    if (complexity === 1) {
      pg.triangle(-size / 2, -size / 2, size / 2, size / 2, -size / 2, size / 2);
    } else if (complexity === 2) {
      pg.triangle(-size / 2, size / 2, 0, -size / 2, size / 2, size / 2);
    }
  } else if (type === "circle") {
    if (complexity === 1) {
      pg.ellipse(0, 0, size, size);
    } else if (complexity === 2) {
      pg.arc(0, 0, size, size, PI, TWO_PI, PIE);
    }
  } else if (type === "abstract") {
    if (complexity === 1) {
      pg.beginShape();
      pg.vertex(-size * 0.5, -size * 0.5);
      pg.bezierVertex(
        -size * 0.5,
        size * 0.3,
        size * 0.5,
        -size * 0.3,
        size * 0.5,
        size * 0.5
      );
      pg.vertex(-size * 0.5, size * 0.5);
      pg.endShape(CLOSE);
    } else if (complexity === 2) {
      pg.noFill();
      pg.stroke(0);
      pg.strokeWeight(2);
      const r = size / 2;
      pg.arc(-r, -r, size, size, 0, HALF_PI);
      pg.arc(r, r, size, size, PI, PI + HALF_PI);
    }
  }
}
function exportPNG() {
  const exportSize = 2000;
  const pg = createGraphics(exportSize, exportSize);
  const originalShapes = [...shapes];

  // Rechne neues gridSize für Export
  const exportGutter = gutter;
  const exportGridSize = (exportSize - (gridDensity - 1) * exportGutter) / gridDensity;
  const totalCellSize = exportGridSize + exportGutter;
  const offsetX = (exportSize - totalCellSize * gridDensity + exportGutter) / 2;
  const offsetY = (exportSize - totalCellSize * gridDensity + exportGutter) / 2;

  pg.noStroke();
  pg.fill(0);
  pg.angleMode(RADIANS);
  pg.ellipseMode(CENTER);
  pg.rectMode(CENTER);

  for (let shape of originalShapes) {
    if (!shape.visible) continue;

    const cx = offsetX + shape.x / canvasWidth * exportSize + exportGridSize / 2;
    const cy = offsetY + shape.y / canvasHeight * exportSize + exportGridSize / 2;

    pg.push();
    pg.translate(cx, cy);
    pg.rotate(shape.rotationIndex * HALF_PI);
    pg.scale(1); // Kein Hover-Effekt beim Export

    drawShapeOnGraphics(pg, shape.shapeType, exportGridSize, shape.complexity);
    pg.pop();
  }

  save(pg, "grid-art-highres.png");
}


function mousePressed() {
  for (let shape of shapes) {
    let cx = shape.x + shape.size / 2;
    let cy = shape.y + shape.size / 2;
    let d = dist(mouseX, mouseY, cx, cy);

    if (d < shape.size / 2) {
      // Alle möglichen Zustände: Blank + Shape/Variant-Kombis
      let shapeVariantPairs = [{ shape: null, variant: null }];
      for (let s of selectedShapes) {
        let max = 1;
        if (s === "square") max = 4;
        else if (s === "triangle" || s === "circle") max = 2;
        else if (s === "abstract") max = 2;

        for (let v of selectedComplexityLevels) {
          if (v <= max) {
            shapeVariantPairs.push({ shape: s, variant: v });
          }
        }
      }

      let currentIndex = shape.visible
        ? shapeVariantPairs.findIndex(
            (entry) =>
              entry.shape === shape.shapeType &&
              entry.variant === shape.complexity
          )
        : 0;

      let next;

      if (keyIsDown(SHIFT)) {
        next = floor(random(shapeVariantPairs.length));
      } else {
        let direction = mouseButton === RIGHT ? -1 : 1;
        next =
          (currentIndex + direction + shapeVariantPairs.length) %
          shapeVariantPairs.length;
      }

      let nextState = shapeVariantPairs[next];

      if (nextState.shape === null) {
        shape.visible = false;
      } else {
        shape.visible = true;
        shape.shapeType = nextState.shape;
        shape.complexity = nextState.variant;
        shape.rotationIndex = (shape.rotationIndex + 1) % 4;
      }

      break;
    }
  }
}


window.onload = () => {
  selectedShapes = [];
selectedComplexityLevels = [];

document.querySelectorAll(".top-button-row button").forEach((btn) => {
  btn.classList.remove("active");
});

document.querySelectorAll("#variantButtons button").forEach((btn) => {
  btn.classList.remove("active");
  btn.disabled = true;
  btn.style.opacity = 0.3;
});

  updateVariantButtonsAvailability();
  generateRandomPattern();
};

// Rechtsklick blockieren
function contextMenu(e) {
  e.preventDefault();
  return false;
}
document.addEventListener("contextmenu", contextMenu);

// Cursor click feedback
document.addEventListener("mousedown", () => {
  document.documentElement.classList.add("cursor-click");
});
document.addEventListener("mouseup", () => {
  document.documentElement.classList.remove("cursor-click");
});
document.addEventListener("mouseleave", () => {
  document.documentElement.classList.remove("cursor-click");
});

function keyPressed() {
  if (key === ' ' || key === 'Spacebar') {
    // Space → randomize
    generateRandomPattern();
    return false; // verhindert Scrollen
  }

  if (key === 's' || key === 'S') {
    // S → save
    exportPNG();
    return false;
  }
}
 
