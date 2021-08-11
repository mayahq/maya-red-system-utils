const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const notifier = require("node-notifier");
var nc = new notifier.NotificationCenter();
const path = require("path");

class DesktopMacosNotify extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {...opts})
    }

    static schema = new Schema({
        name: 'desktop-macos-notify',
        label: 'desktop-macos-notify',
        category: 'Maya Red System Utils',
        isConfig: false,
        fields: {
            title: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
            message: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
            closeBtn: new fields.Typed({type: 'str', defaultVal: 'Close', allowedTypes: ['msg', 'flow', 'global']}),
            actionBtn: new fields.Typed({type: 'str', defaultVal: 'Got it', allowedTypes: ['msg', 'flow', 'global']}),
            reply: new fields.Typed({type: 'bool', defaultVal: true, allowedTypes: ['msg', 'flow', 'global']}),
            wait: new fields.Typed({type: 'bool', defaultVal: true, allowedTypes: ['msg', 'flow', 'global']}),
            sound: new fields.Typed({type: 'bool', defaultVal: true, allowedTypes: ['msg', 'flow', 'global']}),
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        let options = {
            title: vals.title,
            message: vals.message,
            icon: path.join(__dirname, "../../assets/icon.png"),
            closeLabel: vals.closeBtn,
            actions: vals.actionBtn,
            reply: vals.reply,
            sound: vals.sound,
            wait: vals.wait
        };

        nc.notify(options, (err, response, metadata) => {
            // Response is response from notification
            if (err){
              console.log(err)
              this.setStatus("ERROR", "error: " + err.toString().substring(0, 10) + "...");
              // throw err
            }
            this.setStatus("SUCCESS", "");
            msg.notification = metadata;
            if (metadata.activationType === "timeout") {
              return [null, null, msg, null, null];
            } else if (metadata.activationType === "replied") {
              msg.notification.reply = metadata.activationValue
              return [null, msg, null, null, null];
            } else if (metadata.activationType === "actionClicked") {
              return [null, null, null, msg, null];
            } else if (metadata.activationType === "closed") {
              return [null, null, null, null, msg];
            } else {
              return [msg, null, null, null, null];
            }
            // Metadata contains activationType, activationAt, deliveredAt
        });
    }
}

module.exports = DesktopMacosNotify