var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;

var data = fs.readFileSync('./deal-2.csv', 'utf8');

var data = data.split("\n");

for (var i = 0; i < data.length; i++) {
    data[i] = data[i].split(",");
}

fs.writeFileSync('htmlTable.html', ''); //cleaning html file

//Writing Html file. Creating Table
var htmlString = '<!DOCTYPE html>' +
    '<html><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">' +
    '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>' +
    '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>' +
    '</head> <body><table class="table">';
fs.appendFileSync('htmlTable.html', htmlString);

htmlString = '<thead><tr>';
fs.appendFileSync('htmlTable.html', htmlString);
for (var i = 0; i < data[0].length; i++) {
    htmlString = "<th>" + data[0][i] + "</th>";
    fs.appendFileSync('htmlTable.html', htmlString);
}

htmlString = '</tr></thead><tbody>';
fs.appendFileSync('htmlTable.html', htmlString);
for (var i = 1; i < data.length; i++) {
    htmlString = '<tr>';
    fs.appendFileSync('htmlTable.html', htmlString);
    for (var j = 0; j < data[i].length; j++) {
        htmlString = "<td>" + data[i][j] + "</td>";
        fs.appendFileSync('htmlTable.html', htmlString);
    }
    htmlString = '</tr>';
    fs.appendFileSync('htmlTable.html', htmlString);
}
htmlString = '</tbody> </table></body></html>';
fs.appendFileSync('htmlTable.html', htmlString);

var cp = childProcess.spawnSync(binPath, ['./renderpdf.js'], { //creating PDF Table.
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8'
});