const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const clipboard = require("copy-paste");

class DesktopClipboardAdd extends Node {
    constructor(node, RED) {
        super(node, RED)
    }

    static schema = new Schema({
        name: 'desktop-clipboard-add',
        label: 'desktop-clipboard-add',
        category: 'Maya Red System Utils',
        isConfig: false,
        fields: {
            text: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        clipboard.copy(vals.text, function (error) {
            if (error) {
                this.setStatus("ERROR", "error: " + error.toString().substring(0, 10) + "...");
            } else {
                this.setStatus("SUCCESS", "added to clipboard!");
            }
            return msg;
        });
    }
}

module.exports = DesktopClipboardAdd