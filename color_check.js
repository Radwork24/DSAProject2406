const fs = require('fs');

// We will read the PNG file header to check dimensions
const buffer = fs.readFileSync('src/assets/character.png');
// For a standard PNG, dimensions are at offsets 16 and 20
if (buffer.toString('ascii', 1, 4) === 'PNG') {
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  console.log(`Dimensions: ${width}x${height}`);
} else {
  console.log('Not a valid PNG file.');
}
