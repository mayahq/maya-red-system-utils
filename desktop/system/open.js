module.exports = function (RED) {
  function DesktopSystemOpen(config) {
    RED.nodes.createNode(this, config);
    const FastMQ = require('fastmq');
    const validator = require("path-validation")
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

    async function openFromElectron (fastmqChannel, fastmqTopic, path) {
      var requestChannel;
      // create a client with 'requestChannel' channel name and connect to server.
      FastMQ.Client.connect('', fastmqChannel, {reconnect: false}).then((channel) => { // client connected
          requestChannel = channel;
          let reqPayload;
          if(fastmqTopic === "path"){
            reqPayload = {
              data: {
                  path: path
              }
            };
          }
          else if(fastmqTopic === "url"){
            reqPayload = {
              data: {
                  url: path
              }
            };
          }
          return requestChannel.request(fastmqChannel, fastmqTopic, reqPayload, 'json');
      }).then((result) => {
          console.log('Got response from master, data:' + result.payload.data);
          // client channel disconnect
          requestChannel.disconnect();
      }).catch((err) => {
          console.log('Got error:', err.stack);
      }).finally(() => {
          if(requestChannel){
              if(!requestChannel._socket.destroyed){
                  console.log("destroying client socket");
                  requestChannel.disconnect();
              }
          }
      });
    }

    //modifying code here
    this.on("input", async (msg) => {
      let target = await getValue(this.target, this.targetType, msg);
      // assuming its either url or filepath
      if(validator.isAbsolutePath(target)){
        openFromElectron("master","path",target);
      }
      else{
        openFromElectron("master","url",target);
      }
      
      node.send(msg);
    });
    oneditprepare: function oneditprepare() {
      $("#node-input-target").val(this.target);
      $("#node-input-targetType").val(this.targetType);
    }
  }
  RED.nodes.registerType("desktop-system-open", DesktopSystemOpen);
};
