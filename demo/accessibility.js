var PDFDocument = require('../');
var fs = require('fs');
var jsonObj;

fs.readFile("./sam.json", "utf8", (err, jsonString) => {
  if (err) {
    console.log("File read failed:", err);
    return;
  }
  console.log("File read sucessfully\n");
  jsonObj = JSON.parse(jsonString);
  // Create a new PDFDocument
  var doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 6,
      bottom: 6,
      left: 24,
      right: 24
    }
  });

  const document = new PDFDocument({
    autoFirstPage: true,
    bufferPages: true,
    size: 'A4',
    layout: 'portrait'
  });

  doc.pipe(fs.createWriteStream('sam.pdf'));

  // Set some meta data
  // doc.info['Title'] = 'Test Document';

  // doc.info['Author'] = 'Devon Govett';

  // Register a font name for use later
  doc.registerFont('Roboto', 'fonts/Roboto-Regular.ttf');

  // Initialise document logical structure
  var struct = doc.struct('Document');
  doc.addStructure(struct);

  // Set the font and draw some text
  doc
    .font('Roboto');


//---------------header Info-------------
  // Embed some images
  var imageSection = doc.struct('Sect');
  struct.add(imageSection);

  imageSection.add(doc.struct('H1', () => {
    if(jsonObj.company != undefined)
      doc
        .fontSize(9)
        .text(jsonObj.company.businessName, 50, 7)
        .fontSize(7)
        .text(jsonObj.company.address.addressLine1, 50, 19)
        .text(jsonObj.company.address.city + ', '
          + jsonObj.company.address.state + ' '
          + jsonObj.company.address.zip, 50, 28)
        .text('(' + jsonObj.company.phone.areaCode + ') ' 
          + jsonObj.company.phone.number)
        .text(jsonObj.company.email);
  }));

  imageSection.add(doc.struct('H2', () => {
    if(jsonObj.billto != undefined)
      doc
        .fontSize(7)
        .text('Bill To:', 50, 82)
        .fontSize(10)
        .text(jsonObj.billto.name, 50, 92)
        .fontSize(7)
        .text(jsonObj.billto.addressLine1, 50, 103)
        .text(jsonObj.billto.city + ', '
          + jsonObj.billto.state + ' '
          + jsonObj.billto.zip, 50, 113);
  }));

  imageSection.add(doc.struct('H3', () => {
    if(jsonObj.serviceAddress != undefined)
      doc
        .fontSize(7)
        .text('Service Address:', 350, 82)
        .fontSize(7)
        .text(jsonObj.serviceAddress.addressLine1, 350, 92)
        .text(jsonObj.serviceAddress.city + ', '
          + jsonObj.serviceAddress.state + ' '
          + jsonObj.serviceAddress.zip, 350, 103);
  }));

  imageSection.add(doc.struct('H3', () => {
    if(jsonObj.number != undefined && jsonObj.date != undefined && jsonObj.dueDate != undefined)
      doc
        .fontSize(7)
        .text('Invoice No: ' + jsonObj.number, 462, 84)
        .text('Invoice Date: ' + new Date(jsonObj.date).toLocaleDateString(), 462, 93)
        .text('Due Date: ' + new Date(jsonObj.dueDate).toLocaleDateString(), 462, 101);
  }));

  imageSection.add(doc.struct('Figure', {
    alt: "Photograph of a path flanked by blossoming trees with surrounding hedges. "
  }, () => {
    doc
      .image('images/company.png', 480, 10, {
        width: 60
      });
  }));

  imageSection.end();

//--------- header Info---------

var tag_off_x = 25, tag_off_y = 143;


//--------- List Items ---------
if(jsonObj.summaryOfWork != undefined){
  var summarySection = doc.struct('Sect');
  struct.add(summarySection);

  summarySection.add(doc.struct('H', () => {
    if(tag_off_x != 25 || tag_off_y !=143) {
      doc.moveDown(3);
      doc.x = 25;
      tag_off_x = 25;
      tag_off_y = doc.y;
    }
    doc
      .fontSize(8)
      .text('Summary of Work', tag_off_x, tag_off_y)
      .lineWidth(0.5)
      .strokeColor('gray')
      .moveTo(tag_off_x, tag_off_y + 10)
      .lineTo(tag_off_x + 543, tag_off_y + 10);

    doc.fontSize(5)
      .text(jsonObj.summaryOfWork, doc.x, tag_off_y + 16, {lineGap: 7});
  }));
  tag_off_x = 25;
  tag_off_y = doc.y;
}

//----------List Items----------

//--------- List Items ---------
  if(jsonObj.activities != undefined){
    var paymentSection = doc.struct('Sect');
    struct.add(paymentSection);

    paymentSection.add(doc.struct('H', () => {
      if(tag_off_x != 25 || tag_off_y !=143) {
        doc.moveDown(3);
        doc.x = 25;
        tag_off_x = 25;
        tag_off_y = doc.y;
      }
      doc
        .fontSize(8)
        .text('List Items', tag_off_x, tag_off_y)
        .lineWidth(0.5)
        .strokeColor('gray')
        .moveTo(tag_off_x, tag_off_y + 10)
        .lineTo(tag_off_x + 543, tag_off_y + 10);
      doc
        .text('DESCRIPTION',tag_off_x+ 10, tag_off_y + 27)
        .text('QUANTITY', tag_off_x+ 275, tag_off_y + 27)
        .text('RATE', tag_off_x+ 341, tag_off_y + 27)
        .text('AMOUNT', tag_off_x+ 440, tag_off_y + 27)
        .moveTo(tag_off_x + 8, tag_off_y + 37)
        .lineTo(tag_off_x + 535, tag_off_y + 37)
        .stroke();
      var st_off_y = tag_off_y + 23;
      tag_off_y += 37;
      var tmpstr = JSON.stringify(jsonObj.activities);
      var strList = tmpstr.slice(0, -2).split('},'), tmp;
      strList.forEach((str) => {
        tmp = str.slice(str.indexOf(':{')+1);
        tmp += '}';
        var obj = JSON.parse(tmp);

        doc
          .fontSize(7)
            .text(obj.name, 35, tag_off_y + 6,{
              width: 263,
            })
            .text(obj.description, {
              width: 263,
            })
            .text(obj.quantity, 303, tag_off_y + 6,{
              width: 67,
            })
            .text('$' + Number(obj.rate).toFixed(2), 365, tag_off_y + 6,{
              width: 99,
            })
            .text('$' + Number(obj.amount).toFixed(2), 466, tag_off_y + 6,{
              width: 99,
            })
            .moveTo(35, tag_off_y + 27)
            .lineTo(560, tag_off_y + 27)
            .stroke()
          ;
        tag_off_y += 27;
      });
      doc
        .moveTo(tag_off_x + 273, st_off_y)
        .lineTo(tag_off_x + 273, tag_off_y)
        .moveTo(tag_off_x + 339, st_off_y)
        .lineTo(tag_off_x + 339, tag_off_y)
        .moveTo(tag_off_x + 438, st_off_y)
        .lineTo(tag_off_x + 438, tag_off_y)
        .stroke()
      ;
    }));

    doc.moveDown();
    doc.x = 25;
    tag_off_x = 25;
    tag_off_y = doc.y;
    paymentSection.add(doc.struct('Div', () => {
      doc
        .fontSize(7)
        .text('Subtotal  $' + jsonObj.subtotal.toFixed(2), doc.x, tag_off_y + 10, {
          width: 532,
          align: 'right',
        })
        .moveDown(0.4)
        .text('Convenience Fee (' + jsonObj.convenienceFee +'%)  $' + jsonObj.convenienceFees.toFixed(2), {
          width: 532,
          align: 'right',
        })
        .moveDown(0.4)
        .text('Tax (' + jsonObj.taxRate + '%)  $' + jsonObj.taxes.toFixed(2), {
          width: 532,
          align: 'right',
        })
        .moveDown(0.4)
        .text('Total  $' + jsonObj.total.toFixed(2), {
          width: 532,
          align: 'right',
        })
    }));
  }

  //----------List Items----------
  

//--------- Pay Items ---------
  if(jsonObj.payments != undefined) {
    var paymentSection = doc.struct('Sect');
    struct.add(paymentSection);

    paymentSection.add(doc.struct('H', () => {
      if(tag_off_x != 25 || tag_off_y !=143) {
        doc.moveDown(3);
        doc.x = 25;
        tag_off_x = 25;
        tag_off_y = doc.y;
      } 
      doc
        .fontSize(8)
        .text('Payments & Refunds', tag_off_x, tag_off_y)
        .lineWidth(0.5)
        .strokeColor('gray')
        .moveTo(tag_off_x, tag_off_y + 10)
        .lineTo(tag_off_x + 543, tag_off_y + 10);
      doc
        .text('DATE',tag_off_x+ 10, tag_off_y + 27)
        .text('RATE', tag_off_x+ 120, tag_off_y + 27)
        .text('AMOUNT', tag_off_x+ 440, tag_off_y + 27)
        .moveTo(tag_off_x + 8, tag_off_y + 37)
        .lineTo(tag_off_x + 535, tag_off_y + 37)
        .stroke();
      var st_off_y = tag_off_y + 23;
      tag_off_y += 37;

      var tmpstr = JSON.stringify(jsonObj.payments);
      var strList = tmpstr.slice(0, -2).split('},'), tmp;
      strList.forEach((str) => {
        tmp = str.slice(str.indexOf(':{')+1);
        tmp += '}';
        var obj = JSON.parse(tmp);
        doc
          .fontSize(7)
            .text(new Date(obj.created).toLocaleDateString(), 35, tag_off_y + 8,{
              width: 110,
            })
            .text(obj.object, 145, tag_off_y + 8,{
              width: 310,
            })
            .text(obj.description, {
              width: 310,
            })
            .text('$' + Number(obj.amount).toFixed(2), 466, tag_off_y + 8,{
              width: 99,
            })
            .moveTo(35, tag_off_y + 27)
            .lineTo(560, tag_off_y + 27)
            .stroke()
          ;
        tag_off_y += 27;
      });
      doc
        .moveTo(143, st_off_y)
        .lineTo(143, tag_off_y)
        .moveTo(tag_off_x + 438, st_off_y)
        .lineTo(tag_off_x + 438, tag_off_y)
        .stroke()
      ;
    }));

    doc.moveDown();
    doc.x = 25;
    tag_off_x = 25;
    tag_off_y = doc.y;
    paymentSection.add(doc.struct('Div', () => {
      doc
        .fontSize(7)
        .text('Total Paid  $' + jsonObj.paymentTotal.toFixed(2), doc.x, tag_off_y + 10, {
          width: 532,
          align: 'right',
        })
    }));
  }
//----------Pay Items----------



  //--------balance fee---------
  
  doc.moveDown();
  doc.x = 25;
  tag_off_x = 25;
  tag_off_y = doc.y;
  paymentSection.add(doc.struct('Div', () => {
    doc
      .text('Balance Due', doc.x, tag_off_y + 19, {
        width: 555,
        align: 'center',
      });
    doc
      .fontSize(33)
      .fillColor('#4183C4')
      .text('$' + jsonObj.balance.toFixed(2), tag_off_x + 222, tag_off_y + 29, {
        width: 120,
        height: 33,
        align: 'left',
      });
  }));

  //---------Fees---------


//--------Terms------------
  // Draw some text wrapped to 412 points wide, split into paragraphs
  doc.moveDown(0.2);
  doc.x = 25;
  tag_off_x = 25;
  tag_off_y = doc.y;
  var wrappedSection = doc.struct('Sect');
  struct.add(wrappedSection);

  wrappedSection.add(doc.struct('H', () => {
    doc
      .fontSize(8)
      .fillColor('black')
      .text('Terms and Conditions', tag_off_x, tag_off_y)
      .lineWidth(0.5)
      .strokeColor('gray')
      .moveTo(tag_off_x, tag_off_y + 10)
      .lineTo(tag_off_x + 543, tag_off_y + 10)
      .stroke();
  }));

  var stringList = jsonObj.terms.split('</p>');
  stringList.pop();

  wrappedSection.add(doc.struct('H1', () => {
    var string = stringList[0];
    var tmpList, tmp;
    tmpList = string.split('</span>');
    tmp = tmpList[0];
    doc
      .fontSize(6)
      .text(tmp.slice(tmp.lastIndexOf('>')+1), 25, tag_off_y + 18)
      .moveDown(2);
  }));

  wrappedSection.add(doc.struct('P', () => {
    doc.fontSize(5);
    stringList.splice(0, 1);
    var resultStr = '';
    stringList.forEach((str) => {
      var string = str.slice(str.indexOf('>') + 1);
      var tmpList;
      tmpList = string.split('</span>');
      if(string.indexOf('<span') != -1)
        tmpList.pop();
      tmpList.forEach((tmp) => {
        var str;
        if(tmp.indexOf('<span') != -1){
          str = tmp.slice(tmp.indexOf('>') + 1);
          resultStr += (str);
        }
        else {
          doc.text('', {lineGap: 7});
        }
      });
      var brList = resultStr.split('<br>');
      brList.forEach((result) => {
        doc.text(result, {lineGap: 7});
      });
      resultStr = '';
    });
  }));

  //---------------Contact----------
  // Add some text with annotations
  var linkSection = doc.struct('Sect');
  struct.add(linkSection);

  linkSection.add(doc.struct('Link', {
    alt: "Here is a link! "
  }, () => {
    doc.moveDown(5);
    doc
      .fontSize(7)
      .text('Due Upon Receipt Thank you for the opportunity to earn your business.', 46, doc.y)
      .moveDown(2)
      .text('Contact us today! My cell number is 904-305-7534, please call or message me anytime, or you can contact us online at ')
      .moveUp()
      .fillColor('#4183C4')
      .fontSize(6)
      .text('http://www.americanmadedumpsters.com/contact/.', 415, doc.y, {
        link: 'http://www.americanmadedumpsters.com/contact/'
      })
      .fontSize(7)
      .moveDown(2)
      .fillColor('black')
      .text('We also offer financing on all equipment!', 46, doc.y)
      .moveDown(2)
      .text('In addtion we recommend Docket, the all-in-one software tool for the waste and recycling industry, Endorsed by John D Arwood.')
      .moveDown(2)
      .text('Please visit ')
      .fillColor('#4183C4')
      .moveUp()
      .fontSize(6)
      .text('http://bit.ly/WasteRecyclingSoftware', 83, doc.y)
      .fillColor('black')
      .fontSize(7)
      .moveUp()
      .text('to start your free trial.', 183, doc.y);
  }));

  linkSection.end();

  // End and flush the document
  doc.end();
});

