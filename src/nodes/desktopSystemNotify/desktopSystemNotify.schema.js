const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk')
const notifier = require("node-notifier");
const path = require("path");

class DesktopSystemNotify extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {...opts})
    }

    static schema = new Schema({
        name: 'desktop-system-notify',
        label: 'desktop-system-notify',
        category: 'Maya Red System Utils',
        isConfig: false,
        fields: {
            title: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
            message: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
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
            sound: vals.sound,
            wait: vals.wait
        };
        notifier.notify(options, (err, response, metadata) => {
            // Response is response from notification
            if (err){
              msg["__isError"] = true
              this.setStatus("ERROR", "error: " + err.toString().substring(0, 10) + "...");
              return [msg, null]
            }
            this.setStatus("SUCCESS", "");
            msg.notification = metadata;
            if(metadata){
              if (metadata.activationType === "timeout") {
                return [null, msg];
              } else {
                return [msg, null];
              }
            } else{
              return [msg, null];
            }
            // Metadata contains activationType, activationAt, deliveredAt
          });
    }
}

module.exports = DesktopSystemNotify