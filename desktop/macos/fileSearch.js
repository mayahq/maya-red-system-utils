const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = function (RED) {
  function DesktopMacOSFileSeach(config) {
    RED.nodes.createNode(this, config);
    this.fileName = config.fileName;
    this.kind = config.kind;
    this.onlyin = config.onlyin;
    var node = this;

    const getIcon = async (filePath) => {
      const {stdout, stderr, err} = await exec(`ls ${filePath.replace(/\s/g, '\\ ')+"/Contents/Resources/*.icns"}`);
      if(stderr || err){
          return "";
      }
      return stdout.split('\n')[0]
    }

    const findFiles = async (fileName, kind, onlyin) => {
      let out = [];
      let allowedKinds = ["app", "application", "applications", "audio", "music", "folder", "folders", "image", "images", "movie", "movies", "pdf", "pdfs", "presentation", "presentations", "email", "emails"];
      if(!(fileName && fileName!== "")){
        return {out, err: "invalid configs"};
      }
      console.log("configs", fileName, kind, onlyin)
      try{
          let command = `cd ~ && mdfind kind:${kind && allowedKinds.includes(kind) ? kind : "app"} ${onlyin ? "-onlyin "+onlyin+" " : ""}${fileName}`;
          const {stdout,stderr} = await exec(command);
          if(stderr){
              throw Error(stderr);
          }
          //console.log(stdout);
          let filePaths = stdout.slice(0,-1).split('\n');
          
          for(let filePath of filePaths){
              var displayName = filePath.substring(filePath.lastIndexOf("/")+1, filePath.length-4);
              let obj = {
                  "value" : displayName, 
                      "meta": {
                          "path": filePath,
                          "kind": kind
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

    //modifying code here
    this.on("input", async (msg) => {
      // fetch details from msg.payload as well
      const {fileName,kind,onlyin} = msg.payload;
      this.fileName = this.fileName ? this.fileName : fileName;
      this.kind = this.kind ? this.kind : kind;
      this.onlyin = this.onlyin ? this.onlyin : onlyin;
      const {out,err} = await findFiles(this.fileName,this.kind, this.onlyin);
      if(err){
        node.error(err)
      }
      msg.payload = out;
      node.send(msg);
    });
  }
  RED.nodes.registerType("desktop-macos-file-search", DesktopMacOSFileSeach);
};
