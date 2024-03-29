const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const clipboard = require("copy-paste");

class DesktopClipboardAdd extends Node {
  constructor(node, RED, opts) {
    super(node, RED, { ...opts });
  }

  static schema = new Schema({
    name: "desktop-clipboard-add",
    label: "desktop-clipboard-add",
    category: "Maya Red System Utils",
    isConfig: false,
    fields: {
      text: new fields.Typed({
        type: "str",
        defaultVal: "",
        allowedTypes: ["msg", "flow", "global"],
      }),
    },
  });

  onInit() {
    // Do something on initialization of node
  }

  async onMessage(msg, vals) {
    clipboard.copy(vals.text, (error) => {
      if (error) {
        this.setStatus(
          "ERROR",
          "error: " + error.toString().substring(0, 10) + "..."
        );
      } else {
        msg["__isError"] = true;
        this.setStatus("SUCCESS", "added to clipboard!");
      }
      return msg;
    });
  }
}

module.exports = DesktopClipboardAdd