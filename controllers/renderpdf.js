const webPage = require('webpage');
const path = require('path')
const page = webPage.create();
console.log("heeey3");

page.viewportSize = { width: 1920, height: 1080 };
page.open("file:///" + __dirname + "/table-template.html", function start(status) { //open Table page
  if (status === 'success') {
    page.render('../tables/tabla.pdf', { format: 'pdf', quality: '100' }); //Rendering table
  }
  phantom.exit();
});

console.log("heeey4");