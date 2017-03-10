const webPage = require('webpage');
const path = require('path')
const page = webPage.create();

page.viewportSize = { width: 1920, height: 1080 };
page.open("file:///C:/Users/ONDECODE/Documents/JsonToPdf/table-template.html", function start(status) { //open Table page
  if (status === 'success') {
    page.render(path.join(__dirname, '../tables/tabla.pdf'), { format: 'pdf', quality: '100' }); //Rendering table
  }
  phantom.exit();
});