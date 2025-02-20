// worker.js

self.onmessage = function (e) {
  var data = e.data;
  var totalShapes = data.totalShapes;
  var containerWidth = data.containerWidth;
  var containerHeight = data.containerHeight;
  var minSize = data.minSize;
  var maxSize = data.maxSize;
  var maxAttempts = data.maxAttempts;

  var shapes = [];
  var shapeTypes = ["circle", "square", "triangle", "hexagon"];
  var overallAttempts = 0;
  var maxOverallAttempts = totalShapes * 10; // safeguard to avoid infinite loop

  // Utility: random integer between min and max (inclusive)
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // Utility: random uppercase letter (A-Z)
  function getRandomLetter() {
    var charCode = getRandomInt(65, 90);
    return String.fromCharCode(charCode);
  }
  // Check if two rectangles overlap
  function isOverlapping(rectA, rectB) {
    return !(
      rectA.x + rectA.size <= rectB.x ||
      rectA.x >= rectB.x + rectB.size ||
      rectA.y + rectA.size <= rectB.y ||
      rectA.y >= rectB.y + rectB.size
    );
  }

  while (shapes.length < totalShapes && overallAttempts < maxOverallAttempts) {
    overallAttempts++;
    var shape = shapeTypes[getRandomInt(0, shapeTypes.length - 1)];
    var size = getRandomInt(minSize, maxSize);
    var number, letter, text;
    // Ensure unique number per shape type so far
    do {
      number = getRandomInt(1, 99);
      letter = getRandomLetter();
      text = number + letter;
    } while (
      shapes.some(function (s) {
        return s.shape === shape && s.number === number;
      })
    );

    // Try to find a non-overlapping random position (up to maxAttempts)
    var pos = null;
    var attempts = 0;
    while (attempts < maxAttempts) {
      attempts++;
      var posX = getRandomInt(0, containerWidth - size);
      var posY = getRandomInt(0, containerHeight - size);
      var newRect = { x: posX, y: posY, size: size };
      var overlapping = false;
      for (var j = 0; j < shapes.length; j++) {
        var existingRect = {
          x: shapes[j].posX,
          y: shapes[j].posY,
          size: shapes[j].size,
        };
        if (isOverlapping(newRect, existingRect)) {
          overlapping = true;
          break;
        }
      }
      if (!overlapping) {
        pos = { x: posX, y: posY };
        break;
      }
    }
    // If no valid position is found after maxAttempts, force placement
    if (!pos) {
      pos = {
        x: getRandomInt(0, containerWidth - size),
        y: getRandomInt(0, containerHeight - size),
      };
    }
    shapes.push({
      shape: shape,
      size: size,
      number: number,
      letter: letter,
      text: text,
      posX: pos.x,
      posY: pos.y,
    });
    // Send progress update every 5 shapes
    if (shapes.length % 5 === 0) {
      self.postMessage({ progress: shapes.length, total: totalShapes });
    }
  }
  // Ensure exactly totalShapes are generated
  while (shapes.length < totalShapes) {
    // Force-add shapes with random positions (without overlap check)
    var shape = shapeTypes[getRandomInt(0, shapeTypes.length - 1)];
    var size = getRandomInt(minSize, maxSize);
    var number, letter, text;
    do {
      number = getRandomInt(1, 99);
      letter = getRandomLetter();
      text = number + letter;
    } while (
      shapes.some(function (s) {
        return s.shape === shape && s.number === number;
      })
    );
    var pos = {
      x: getRandomInt(0, containerWidth - size),
      y: getRandomInt(0, containerHeight - size),
    };
    shapes.push({
      shape: shape,
      size: size,
      number: number,
      letter: letter,
      text: text,
      posX: pos.x,
      posY: pos.y,
    });
    if (shapes.length % 5 === 0) {
      self.postMessage({ progress: shapes.length, total: totalShapes });
    }
  }
  // Finally, send the shapes data back
  self.postMessage({ shapes: shapes });
};
