var clipboard = require("copy-paste");
module.exports = function (RED) {
  function DesktopClipboardAdd(config) {
    RED.nodes.createNode(this, config);
    this.text = config.text;
    this.textType = config.textType;
    var node = this;

    async function getValue(value, valueType, msg) {
      return new Promise(function (resolve, reject) {
        if (valueType === "str") {
          resolve(value);
        } else {
          RED.util.evaluateNodeProperty(
            value,
            valueType,
            this,
            msg,
            function (err, res) {
              if (err) {
                node.error(err.msg);
                reject(err.msg);
              } else {
                resolve(res);
              }
            }
          );
        }
      });
    }

    //modifying code here
    this.on("input", async function (msg) {
      console.log(this.text);
      let text = await getValue(this.text, this.textType, msg);
      clipboard.copy(text, function (error) {
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
