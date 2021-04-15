const notifier = require("node-notifier");
var nc = new notifier.NotificationCenter();
const path = require("path");

module.exports = function (RED) {
  function DesktopMacOSNotify(config) {
    RED.nodes.createNode(this, config);
    this.title = config.title;
    this.titleType = config.titleType;
    this.message = config.message;
    this.messageType = config.messageType;
    this.closeBtn = config.closeBtn;
    this.closeBtnType = config.closeBtnType;
    this.actionBtn = config.actionBtn;
    this.actionBtnType = config.actionBtnType;
    this.reply = config.reply;
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
      let closeBtn = await getValue(this.closeBtn, this.closeBtnType, msg);
      let actionBtn = await getValue(this.actionBtn, this.actionBtnType, msg);

      let options = {
        title: title,
        message: message,
        icon: path.join(__dirname, "../../assets/icon.png"),
      };
      if (closeBtn !== "" || actionBtn !== "") {
        options.closeLabel = closeBtn || "Close";
        options.actions = actionBtn || "Got it";
      }
      if (this.reply === true) {
        options.reply = true;
      }
      if (this.sound === true) {
        options.sound = true;
      }
      if (this.wait === true) {
        options.wait = true;
      }
      nc.notify(options, (err, response, metadata) => {
        // Response is response from notification
        if (err) throw err;

        msg.notification = metadata;
        if (metadata.activationType === "timeout") {
          node.send([null, null, msg, null, null]);
        } else if (metadata.activationType === "replied") {
          node.send([null, msg, null, null, null]);
        } else if (metadata.activationType === "actionClicked") {
          node.send([null, null, null, msg, null]);
        } else if (metadata.activationType === "closed") {
          node.send([null, null, null, null, msg]);
        } else {
          node.send([msg, null, null, null, null]);
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
      $("#node-input-closeBtn").val(this.closeBtn);
      $("#node-input-closeBtnType").val(this.closeBtnType);
      $("#node-input-actionBtn").val(this.actionBtn);
      $("#node-input-actionBtnType").val(this.actionBtnType);
      $("#node-input-reply").val(this.reply);
      $("#node-input-sound").val(this.sound);
      $("#node-input-wait").val(this.wait);
    }
  }
  RED.nodes.registerType("desktop-macos-notify", DesktopMacOSNotify);
};
