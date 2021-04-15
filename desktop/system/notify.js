const notifier = require("node-notifier");
const path = require("path");
module.exports = function (RED) {
  function DesktopSystemNotify(config) {
    RED.nodes.createNode(this, config);
    this.title = config.title;
    this.titleType = config.titleType;
    this.message = config.message;
    this.messageType = config.messageType;
    this.wait = config.wait;
    this.sound = config.sound;
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
      let title = await getValue(this.title, this.titleType, msg);
      let message = await getValue(this.message, this.messageType, msg);

      let options = {
        title: title,
        message: message,
        icon: path.join(__dirname, "../../assets/icon.png"),
      };

      if (this.sound === true) {
        options.sound = true;
      }
      if (this.wait === true) {
        options.wait = true;
      }
      notifier.notify(options, (err, response, metadata) => {
        // Response is response from notification
        if (err) throw err;

        msg.notification = metadata;
        if (metadata.activationType === "timeout") {
          node.send([null, , msg]);
        } else {
          node.send([msg, null]);
        }

        return;

        // Metadata contains activationType, activationAt, deliveredAt
      });
    });
    oneditprepare: function oneditprepare() {
      $("#node-input-title").val(this.title);
      $("#node-input-titleType").val(this.titleType);
      $("#node-input-message").val(this.message);
      $("#node-input-messageType").val(this.messageType);
      $("#node-input-sound").val(this.sound);
      $("#node-input-wait").val(this.wait);
    }
  }
  RED.nodes.registerType("desktop-system-notify", DesktopSystemNotify);
};
