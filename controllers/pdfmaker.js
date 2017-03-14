const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const phantomjs = require('phantomjs');
const binPath = phantomjs.path;
const templatePath = path.join(__dirname, 'table-template.html')
const renderpdfPath = path.join(__dirname, 'renderpdf.js')

function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    //if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function (m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
}

module.exports = {
    createHtmlTemplate: function (data) {
        
        data = data.split("\n");

        for (let i = 0; i < data.length; i++) {
            data[i] = data[i].replace(/\\r/g, '');
            data[i] = CSVtoArray(data[i]);
        }

        fs.writeFileSync(templatePath, ''); //cleaning html file

        //Writing Html file. Creating Table
        let htmlString = '<!DOCTYPE html>' +
            '<html><head><meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" >' +
            '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>' +
            '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>' +
            '</head> <body><table class="table  table-bordered" >';
        fs.appendFileSync(templatePath, htmlString);

        htmlString = '<thead><tr>'; //column titles
        fs.appendFileSync(templatePath, htmlString);
        for (let i = 0; i < data[0].length; i++) {
            htmlString = '<th>' + data[0][i] + '</th>';
            fs.appendFileSync(templatePath, htmlString);
        }
        htmlString = '</tr></thead><tbody>'; //rows
        fs.appendFileSync(templatePath, htmlString);
        for (let i = 1; i < data.length; i++) {
            htmlString = '<tr>';
            fs.appendFileSync(templatePath, htmlString);
            for (let j = 0; j < data[i].length; j++) {
                htmlString = '<td><div  style="min-height: 40px;">' + data[i][j] + '</div></td>';
                fs.appendFileSync(templatePath, htmlString);
            }
            htmlString = '</tr>';
            fs.appendFileSync(templatePath, htmlString);
        }
        htmlString = '</tbody> </table></body></html>';
        fs.appendFileSync(templatePath, htmlString);
    },
    generatePdf: function (tableName) {

        var cp = childProcess.spawnSync(binPath, ['controllers/renderpdf.js', __dirname, tableName], { //creating PDF Table.
            cwd: process.cwd(),
            env: process.env,
            stdio: 'pipe',
            encoding: 'utf-8'
        });

        return path.join(__dirname, '../tables/' + tableName  + '.pdf');
    }
}


