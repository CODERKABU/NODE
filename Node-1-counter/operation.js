let counter = 0;

module.exports.add = () => {
  counter++;
  return counter;
};

module.exports.sub = () => {
  counter--;
  return counter;
};
