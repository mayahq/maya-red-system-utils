const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
const FastMQ = require('fastmq');
class DesktopSystemOpen extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {...opts})
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
                msg["__isError"] = true
            }).finally(() => {
                if(requestChannel){
                    if(!requestChannel._socket.destroyed){
                        console.log("destroying client socket");
                        requestChannel.disconnect();
                    }
                }
                return msg;
            });
        }

        const stringIsAValidUrl = (s) => {
            try {
                new URL(s);
                return true;
            } catch (err) {
                return false;
            }
        };

        if(stringIsAValidUrl(vals.target)){
          if (
            vals.target.startsWith("https://") ||
            vals.target.startsWith("http://")
          ) {
            openFromElectron("master", "url", vals.target);
          }
        }
        else{
          openFromElectron("master", "path", vals.target);
        }
    }
}

module.exports = DesktopSystemOpen