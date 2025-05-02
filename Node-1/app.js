let op = require("./operation");

let data = process.argv;
let record = data.slice(2);
let x = parseInt(record[0]);
let y = parseInt(record[1]);
let z = record[2];

if (z == "+") {
  console.log(op.add(x, y));
}else if (z == "-") {
  console.log(op.sub(x, y));
}else if (z == "*") {
  console.log(op.mul(x, y));    
}
else if (z == "/") {
  console.log(op.tri(x, y));
}
else {
  console.log("Invalid Operation");
}