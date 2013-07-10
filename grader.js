#!/usr/bin/env node

var fs = require('fs');
var sys = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1);
	}
	return instr;
};

var cheerioHtmlFile = function(htmlfile) {
	console.log("load file");
	return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtml = function(html) {
	sys.puts(html);
	return cheerio.load(html);
}

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function(html, checkfile, isFile) {
	if(isFile)
		$ = cheerio.load(fs.readFileSync(html));
	else
		$= cheerio.load(html.toString());
	//sys.puts(html);
	var checks = loadChecks(checkfile).sort();
	var out = {}
	for (var ii in checks) {
		//sys.puts($(checks[ii]));
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var clone = function(fn) {
	return fn.bind({});
};

var outJson = function(){
	var out = JSON.stringify(checkJson, null, 4);
	console.log(out);
}

if(require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists),
	CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
		.option('-u, --url <url>', 'Url of the html file')
		.parse(process.argv);
	
	if(program.file){
		checkJson = checkHtml(program.file, program.checks, true);
		outJson(checkJson);
	} else {
		//sys.puts(program.url);
		rest.get(program.url).on('complete', function(result){
			if( result instanceof Error) {
				sys.puts('Error: ' + result.message);
			} else {
				checkJson = checkHtml(result, program.checks, false);
				outJson(checkJson);
			}

		});
	}

} else {
	exports.checkHtmlFile = checkHtmlFile;	
}
