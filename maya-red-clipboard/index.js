// Move the mouse across the screen as a sine wave.
var robot = require("robotjs");

var ncp = require("copy-paste");

setTimeout(() => {
  robot.keyTap("c", ["command"]);
  ncp.paste(function (err, p) {
    console.log(p);
  });
}, 3000);

// setTimeout(() => {
//   ncp.paste(function (err, p) {
//     console.log(p);
//   });
// }, 6000);
