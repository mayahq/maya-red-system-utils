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

    const getIcon = async (filePath, fileName) => {
      const path = filePath.replace(/\s/g, '\\ ');
      const {stdout, stderr, err} = await exec(`ls ${path}/Contents/Resources/*.icns`);
      if(stderr || err){
          console.log("ERROR: ", stderr);
          return "";
      }
      iconList = stdout.split('\n');
      //console.log(iconList)
      // 1) AppIcon.icns
      for(let icon of iconList){
        if(icon.includes('AppIcon') || icon.includes('appicon')){
          // console.log('returning AppIcon.icns', icon, fileName)
          return icon;
        }
      }
      // 2) contains app name(s)
      let fileNameList = fileName.split(' ');
      for(let icon of iconList){
        var temp = icon.substring(icon.lastIndexOf("/")+1, icon.length);
        var lower_icon = temp.substring(0,temp.indexOf('.')).toLowerCase();
        for(l of fileNameList){
          if(l.toLowerCase() === lower_icon){
            // console.log('returning icon matching app name', icon, fileName)
            return icon;
          }
        }
      }
      // 3) 0th index
      // console.log("returning 0th index", iconList[0], fileName);
      return iconList[0];
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
              if(filePath && filePath.length > 0){
                let path = filePath.replace(/\s/g,"\\ ");
                var temp = filePath.substring(filePath.lastIndexOf("/")+1, filePath.length);
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
                    obj.meta.icon = await getIcon(filePath, displayName).catch((e) => {
                        //console.log("here",e);
                    });
                }
                out.push(obj);
              }
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
