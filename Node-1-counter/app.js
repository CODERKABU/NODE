const operation = require('./operation');

const command = process.argv[2];

if (command === 'inc') {
  let result = operation.add();
  console.log('Counter:', result);
} else if (command === 'dec') {
  let result = operation.sub();
  console.log('Counter:', result);
} else {
  console.log('Please use "inc" or "dec"');
}
