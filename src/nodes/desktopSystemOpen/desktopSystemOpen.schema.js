const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const FastMQ = require('fastmq');
const validator = require("path-validation")

class DesktopSystemOpen extends Node {
    constructor(node, RED) {
        super(node, RED)
    }

    static schema = new Schema({
        name: 'desktop-system-open',
        label: 'desktop-system-open',
        category: 'Maya Red System Utils',
        isConfig: false,
        fields: {
            target: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),   
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
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

        // assuming its either url or filepath
        if(validator.isAbsolutePath(vals.target)){
            openFromElectron("master","path",vals.target);
        }
        else{
            openFromElectron("master","url",vals.target);
        }
    }
}

module.exports = DesktopSystemOpen