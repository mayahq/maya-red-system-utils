const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk')
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class DesktopMacosFileSearch extends Node {
    constructor(node, RED) {
        super(node, RED)
    }

    static schema = new Schema({
        name: 'desktop-macos-file-search',
        label: 'desktop-macos-file-search',
        category: 'Maya Red System Utils',
        isConfig: false,
        fields: {
            query: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}),
            kind: new fields.Select({ options: ["app", "application", "applications", "audio", "music", "folder", "folders", "image", "images", "movie", "movies", "pdf", "pdfs", "presentation", "presentations", "email", "emails"], defaultVal: 'app' }),
            onlyin: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']}) 
        },
    })

    onInit() {
        // Do something on initialization of node
    }

    async getIcon(filePath){
      const {stdout, stderr, err} = await exec(`ls ${filePath.replace(/\s/g, '\\ ')+"/Contents/Resources/*.icns"}`);
      if(stderr || err){
          return "";
      }
      return stdout.split('\n')[0]
    }

    async findFiles(query, kind, onlyin){
        let out = [];
        if(!(query && query!== "")){
          return {out, err: "invalid configs"};
        }
        console.log("configs", query, kind, onlyin)
        try{
            let command = `cd ~ && mdfind kind:${kind} ${onlyin ? "-onlyin "+onlyin+" " : ""}${query}`;
            const {stdout,stderr} = await exec(command);
            if(stderr){
                throw Error(stderr);
            }
            //console.log(stdout);
            let filePaths = stdout.slice(0,-1).split('\n');
            
            for(let filePath of filePaths){
                let path = filePath.replace(/\s/g,"\\ ");
                var temp = filePath.substring(filePath.lastIndexOf("/")+1, filePath.length);
                var displayName = temp.substring(0,temp.indexOf('.'));
                let obj = {
                    "value" : displayName, 
                        "meta": {
                            "path": path,
                            "kind": kind,
                            "subtext": kind
                        }
                };
                if(kind === "app"){
                    obj.meta.icon = await getIcon(path).catch((e) => {
                        //console.log("here",e);
                    });
                }
                out.push(obj);
            }
        }
        catch(e){
            return {out, err: e};
            console.log(e);
        }
        return {out, err: null};
      };

    async onMessage(msg, vals) {
        // Handle the message. The returned value will
        // be sent as the message to any further nodes.
        const {out,err} = await findFiles(vals.query, vals.kind, vals.onlyin);
        if(err){
            this.setStatus("ERROR", "error: " + error.toString().substring(0, 10) + "...");
        }
        else{
            this.setStatus("SUCCESS", "file serach successful!");
        }
        msg.payload = out;
        return msg;
    }
}

module.exports = DesktopMacosFileSearch