const webPage = require('webpage');
const page = webPage.create();
var system = require('system');
var args = system.args;
var path = args[1];

page.viewportSize = { width: 1920, height: 1080 };
page.open("file:///" + path + "/table-template.html", function start(status) { //open Table page
  if (status === 'success') {
    page.render('tables/tabla.pdf', { format: 'pdf', quality: '100' }); //Rendering table
  }
  phantom.exit();
});
