var clipboard = require("copy-paste");
module.exports = function (RED) {
  function DesktopClipboardAdd(config) {
    RED.nodes.createNode(this, config);
    // this.text = config.text
    this.text = config.text;
    var node = this;

    //modifying code here
    this.on("input", function (msg) {
      console.log(this.text);

      clipboard.copy(this.text, function (error) {
        if (error) {
          node.status({
            fill: "red",
            shape: "dot",
            text: "error: " + error.toString().substring(0, 10) + "...",
          });
        } else {
          node.status({
            fill: "green",
            shape: "ring",
            text: "added to clipboard!",
          });

          node.send(msg);
        }
      });
    });
    oneditprepare: function oneditprepare() {
      $("#node-input-text").val(this.text);
    }
  }
  RED.nodes.registerType("desktop-clipboard-add", DesktopClipboardAdd);
};
