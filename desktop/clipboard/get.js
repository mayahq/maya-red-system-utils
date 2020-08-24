var clipboard = require("copy-paste");
module.exports = function (RED) {
  function DesktopClipboardGet(config) {
    RED.nodes.createNode(this, config);
    // this.text = config.text

    var node = this;

    //modifying code here
    this.on("input", function (msg) {
      clipboard.paste(function (error, p) {
        if (error) {
          node.status({
            fill: "red",
            shape: "dot",
            text: "error: " + error.toString().substring(0, 10) + "...",
          });
        } else {
          node.status({
            fill: "greed",
            shape: "ring",
            text: "retrieved from clipboard!",
          });
          msg.clipboard = p;
          node.send(msg);
        }
      });
    });
  }
  RED.nodes.registerType("desktop-clipboard-get", DesktopClipboardGet);
};
