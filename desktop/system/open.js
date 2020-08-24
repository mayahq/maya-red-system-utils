module.exports = function (RED) {
  function DesktopSystemOpen(config) {
    RED.nodes.createNode(this, config);
    const open = require("open");
    this.target = config.target;
    this.targetType = config.targetType;
    var node = this;

    //modifying code here
    this.on("input", async (msg) => {
      if (this.targetType === "str") {
        open(this.target);
        node.send(msg);
      } else {
        RED.util.evaluateNodeProperty(
          this.target,
          this.targetType,
          this,
          msg,
          function (err, res) {
            if (err) {
              node.error(err.msg);
            } else {
              console.log(res);
              open(res);
              node.send(msg);
            }
          }
        );
      }
    });
    oneditprepare: function oneditprepare() {
      $("#node-input-target").val(this.target);
      $("#node-input-targetType").val(this.targetType);
    }
  }
  RED.nodes.registerType("desktop-system-open", DesktopSystemOpen);
};
