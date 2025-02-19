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

  for (var i = 0; i < totalShapes; i++) {
    var shape = shapeTypes[getRandomInt(0, shapeTypes.length - 1)];
    var size = getRandomInt(minSize, maxSize);
    var number, letter, text;
    // Ensure that for a given shape type the number is unique
    do {
      number = getRandomInt(1, 99);
      letter = getRandomLetter();
      text = number + letter;
    } while (
      shapes.some(function (s) {
        return s.shape === shape && s.number === number;
      })
    );

    var pos = null;
    var attempt = 0;
    while (attempt < maxAttempts) {
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
      attempt++;
    }
    if (!pos) {
      // Skip shape if no valid position is found
      continue;
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
  }
  // Send computed shapes back to the main thread
  self.postMessage({ shapes: shapes });
};
