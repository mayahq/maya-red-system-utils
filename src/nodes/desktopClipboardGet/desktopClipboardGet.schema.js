const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk')
const clipboard = require("copy-paste");

class DesktopClipboardGet extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {...opts})
    }

    static schema = new Schema({
        name: 'desktop-clipboard-get',
        label: 'desktop-clipboard-get',
        category: 'Maya Red System Utils',
        isConfig: false,
        fields: {
            // Whatever custom fields the node needs.
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        clipboard.paste((error, p) => {
            if (error) {
                msg["__isError"] = true;
                this.setStatus("ERROR", "error: " + error.toString().substring(0, 10) + "...");
            } else {
                this.setStatus("SUCCESS", "retrieved from clipboard!");
            }
            msg.clipboard = p;
            return msg;
        });
    }
}

module.exports = DesktopClipboardGet