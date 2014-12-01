#!/usr/bin/env node

var fs = require("fs"),
    path = require("path"),
    buffer = require("buffer").Buffer,
    config = require("./config.json"),
    packageInfo = require("./package.json"),
    tempalteDir = __dirname + config.tempalteDir;

var targetList = process.argv;

if (targetList[0] == "node") {
    //console.log("Anti-Bug Test Mode:");
    targetList.shift();
} else {
    console.log("Anti-Bug:");
}

targetList.shift();

if ((targetList[0] == null) || (targetList[0] == "man")) {
    manCommand("man");
    process.exit(0);
} else if(targetList[0] == "version"){
	manCommand("version");
	process.exit(0);
} else {
	var praysFile = targetList[0] + ".txt";
    var praysFileDir = path.join(tempalteDir, praysFile);

    if (!fs.existsSync(praysFileDir)) {
        wrongCommand("tempNotFound");
        process.exit(0);
    } else {
        var praysFileStat = fs.statSync(praysFileDir);
    }

    if (praysFileStat.isFile()) {
        var praysContent = fs.readFileSync(praysFileDir, {
            encoding: "utf8"
        });
        targetList.shift();
    } else {
        wrongCommand("commandFormatError");
        process.exit(0);
    }

    if (targetList.length <= 0) {
        wrongCommand("commandFormatError");
        process.exit(0);
    } else {
    	fileProcessor();
    }
}

function fileProcessor() {
    for (var i = 0; i < targetList.length; i++) {
        var target = targetList[i];

        if (!fs.existsSync(target)) {
        	console.log('Target file "' + target + '" not found.');
        	continue;
        } else {
        	var stat = fs.statSync(target);
        }

        if (stat.isFile()) {
            fileMatcher(target);
        } else if (stat.isDirectory()) {
            var list = fs.readdirSync(target);
            list.forEach(function(item) {
                fileMatcher(path.join(target, item));
            });
        }
    }

    function fileMatcher(filePath) {

        //traverse rules
        for (var i = 0; i < config.fileType.length; i++) {
            var configItem = (config.fileType)[i];

            var reg = new RegExp((config.fileType)[i].suffix);
            if (reg.test(filePath)) {
                generator(filePath);
                break;
            }
        }

        function generator(filePath) {
            if (fs.existsSync(filePath)) {
                fs.readFile(filePath, function(err, data) {
                    if (err) throw err;

                    var praysData = praysContent;
                    var lineArr = praysData.split("\n");

                    lineArr.forEach(function(line, index) {
                        lineArr[index] = configItem.prefix + line;
                    });

                    var currentPraysContent = new Buffer(lineArr.join("\n") + "\n");
                    process.stdout.write("Generating:" + filePath + "......");
                    var finalResult = buffer.concat([currentPraysContent, data]);
                    fs.unlinkSync(filePath);
                    fs.writeFileSync(filePath, finalResult)
                    process.stdout.write("Complete\r\n");
                });
            } else {
                console.log("Target file(s) not exist :" + filePath);
            }
        }
    }
}

function wrongCommand(errorCode) {
    switch (errorCode) {
        case "commandFormatError":
            {
                console.log("usage :\n    anti-bug templateName fileA [fileB] ... \n    anti-bug templateName dirName");
                break;
            }
        case "tempNotFound":
            {
                console.log('Template "' + targetList[0] + '" not found!');
                console.log("Please visit : \n\n    " + packageInfo.homepage + "/tree/master" + config.tempalteDir);
                console.log("\nto see the available templates.");
                break;
            }
        case "filePathError":
        {
        	console.log("filePathError");
        	break;
        }
    }
}

function manCommand(manIndex) {
    switch (manIndex) {
        case "man":
            {
            	console.log("==========================================================================================================================");
                console.log("Welcome to Anti-Bug.js!");
                console.log("You can add some magic pray words or pray pictures to the head of your code file(s) simply.");
                console.log("More infomation, please visit : \n\n    " + packageInfo.homepage);
                console.log("\nusage :\n    anti-bug templateName fileA [fileB] ...          Add prays to file(s)");
                console.log("    anti-bug templateName dirName                    Add prays to file(s) in the directory");
                console.log("    anti-bug man                                     Check the manual for help");
                console.log("    anti-bug version                                 Display the version of Anti-Bug.js\n");
                console.log('The "templateName" refers to the name of the template file in directory "template"');
                console.log("Please visit : \n\n    " + packageInfo.githubURL + "/tree/master" + config.tempalteDir);
                console.log("\nto see the available templates and feel free to send pull request to upload the template file (UTF-8) you want to share!");
                console.log("==========================================================================================================================");
                break;
            }
        case "version":
            {
                console.log("Anti-Bug.js\nVersion:"+packageInfo.version);
                break;
            }
    }
}