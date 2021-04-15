module.exports = function (RED) {
  function DesktopSystemOpen(config) {
    RED.nodes.createNode(this, config);
    const open = require("open");
    this.target = config.target;
    this.targetType = config.targetType;
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
    this.on("input", async (msg) => {
      let target = await getValue(this.target, this.targetType, msg);

      open(target);
      node.send(msg);
    });
    oneditprepare: function oneditprepare() {
      $("#node-input-target").val(this.target);
      $("#node-input-targetType").val(this.targetType);
    }
  }
  RED.nodes.registerType("desktop-system-open", DesktopSystemOpen);
};
