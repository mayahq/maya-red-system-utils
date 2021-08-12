const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk')
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class DesktopMacosFileSearch extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {...opts})
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

    async onMessage(msg, vals) {
        const getIcon = async (filePath, fileName) => {
            try {
                const path = filePath.replace(/\s/g, "\\ ");
                const { stdout, stderr, err } = await exec(
                    `ls ${path}/Contents/Resources/*.icns`
                );
                if (stderr || err) {
                    console.log("ERROR: ", stderr);
                    return "";
                }
                const iconList = stdout.split("\n");
                // console.log(iconList)
                // 1) AppIcon.icns
                for (let icon of iconList) {
                    if (icon.includes("AppIcon") || icon.includes("appicon")) {
                    // console.log('returning AppIcon.icns', icon, fileName)
                    return icon;
                    }
                }
                // 2) contains app name(s)
                let fileNameList = fileName.split(" ");
                for (let icon of iconList) {
                    var temp = icon.substring(icon.lastIndexOf("/") + 1, icon.length);
                    var lower_icon = temp.substring(0, temp.indexOf(".")).toLowerCase();
                    for (let l of fileNameList) {
                    if (l.toLowerCase() === lower_icon) {
                        // console.log('returning icon matching app name', icon, fileName)
                        return icon;
                    }
                    }
                }
                // 3) 0th index
                // console.log("returning 0th index", iconList[0], fileName);
                return iconList[0];
            } catch (e) {
                console.log("ERROR occurred: ", e);
            }
          
        };

        const findFiles = async (query, kind, onlyin) => {
          let out = [];
          let allowedKinds = [
            "app",
            "application",
            "applications",
            "audio",
            "music",
            "folder",
            "folders",
            "image",
            "images",
            "movie",
            "movies",
            "pdf",
            "pdfs",
            "presentation",
            "presentations",
            "email",
            "emails",
          ];
          if (!(query && query !== "")) {
            return { out, err: "invalid configs" };
          }
          console.log("configs", query, kind, onlyin);
          try {
            let command = `cd ~ && mdfind kind:${
              kind && allowedKinds.includes(kind) ? kind : "app"
            } ${onlyin ? "-onlyin " + onlyin + " " : ""}${query}`;
            const { stdout, stderr } = await exec(command);
            if (stderr) {
              throw Error(stderr);
            }
            //console.log(stdout);
            let filePaths = stdout.slice(0, -1).split("\n");

            for (let filePath of filePaths) {
              if (filePath && filePath.length > 0) {
                let path = filePath.replace(/\s/g, "\\ ");
                var temp = filePath.substring(
                  filePath.lastIndexOf("/") + 1,
                  filePath.length
                );
                var displayName = temp.substring(0, temp.indexOf("."));
                let obj = {
                  value: displayName,
                  meta: {
                    path: filePath,
                    kind: kind,
                    subtext: kind,
                  },
                };
                if (kind === "app") {
                  obj.meta.icon = await getIcon(filePath, displayName).catch(
                    (e) => {
                      //console.log("here",e);
                    }
                  );
                }
                out.push(obj);
              }
            }
          } catch (e) {
            return { out, err: e };
            console.log(e);
          }
          return { out, err: null };
        };

        const {out,err} = await findFiles(vals.query, vals.kind, vals.onlyin);
        if(err){
            this.setStatus("ERROR", "error: " + error.toString().substring(0, 10) + "...");
        }
        else {
            console.log(out);
            this.setStatus("SUCCESS", "file serach successful!");
        }
        msg.payload = out;
        return msg;
    }
}

module.exports = DesktopMacosFileSearch