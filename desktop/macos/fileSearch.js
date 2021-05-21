const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = function (RED) {
  function DesktopMacOSFileSeach(config) {
    RED.nodes.createNode(this, config);
    this.query = config.query;
    this.queryType = config.queryType;
    this.kind = config.kind;
    this.onlyin = config.onlyin;
    this.onlyinType = config.onlyinType;
    var node = this;

    const getIcon = async (filePath) => {
      const {stdout, stderr, err} = await exec(`ls ${filePath.replace(/\s/g, '\\ ')+"/Contents/Resources/*.icns"}`);
      if(stderr || err){
          return "";
      }
      return stdout.split('\n')[0]
    }

    const findFiles = async (query, kind, onlyin) => {
      let out = [];
      let allowedKinds = ["app", "application", "applications", "audio", "music", "folder", "folders", "image", "images", "movie", "movies", "pdf", "pdfs", "presentation", "presentations", "email", "emails"];
      if(!(query && query!== "")){
        return {out, err: "invalid configs"};
      }
      console.log("configs", query, kind, onlyin)
      try{
          let command = `cd ~ && mdfind kind:${kind && allowedKinds.includes(kind) ? kind : "app"} ${onlyin ? "-onlyin "+onlyin+" " : ""}${query}`;
          const {stdout,stderr} = await exec(command);
          if(stderr){
              throw Error(stderr);
          }
          //console.log(stdout);
          let filePaths = stdout.slice(0,-1).split('\n');
          
          for(let filePath of filePaths){
              var temp = filePath.substring(filePath.lastIndexOf("/")+1, filePath.lengthg);
              var displayName = temp.substring(0,temp.indexOf('.'));
              let obj = {
                  "value" : displayName, 
                      "meta": {
                          "path": filePath,
                          "kind": kind,
                          "subtext": kind
                      }
              };
              if(kind === "app"){
                  obj.meta.icon = await getIcon(filePath).catch((e) => {
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
      // fetch details from msg.payload as well
      // const {query,kind,onlyin} = msg.payload;
      // this.query = this.query ? this.query : query;
      // this.kind = this.kind ? this.kind : kind;
      // this.onlyin = this.onlyin ? this.onlyin : onlyin;

      let query = await getValue(this.query, this.queryType, msg);
      let onlyin = await getValue(this.onlyin, this.onlyinType, msg);
      let kind = this.kind === "msg.payload.kind" ? msg.payload.kind : this.kind;
      const {out,err} = await findFiles(query, kind, onlyin);
      if(err){
        node.error(err)
      }
      msg.payload = out;
      node.send(msg);
    });
    oneditprepare: function oneditprepare() {
      $("#node-input-query").val(this.query);
      $("#node-input-queryType").val(this.queryType);
      $("#node-input-onlyin").val(this.onlyin);
      $("#node-input-onlyinType").val(this.onlyinType);
    }
  }
  RED.nodes.registerType("desktop-macos-file-search", DesktopMacOSFileSeach);
};
