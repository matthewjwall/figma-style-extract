// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(550, 400);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

figma.loadFontAsync({ family: "Roboto", style: "Regular" })

figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'generate-figma-style-guide') {
    const nodes: SceneNode[] = [];
    console.log(nodes)

    //make page for styleGuide
    const styleGuide = figma.createPage();
    styleGuide.name = "Styles"

    const fillStyle = figma.getLocalPaintStyles();
    const textStyle = figma.getLocalTextStyles();
    const effectStyle = figma.getLocalEffectStyles();
    const gridStyle = figma.getLocalGridStyles();


    createFillStyles(fillStyle, styleGuide);
    createTextStyles(textStyle, styleGuide);

    figma.currentPage = styleGuide;
  };


  // currently not in use
  // if (msg.type === 'generate-json-style-guide') {
  //   const data = msg.data;

  //   const styleGuide = figma.createPage();
  //   styleGuide.name = "Styles"

  //   figma.currentPage = styleGuide;
  //   createJSONStyle(data, styleGuide);

  // };


  if (msg.type === 'download'){
    const fillStyles = figma.getLocalPaintStyles();
    const textStyles = figma.getLocalTextStyles();
    const effectStyles = figma.getLocalEffectStyles();
    const gridStyles = figma.getLocalGridStyles();

    const palette = {};
    const typography = {};
    //const effects = {};
    //const grids = {};
    const spacing = {}
    

    fillStyles.forEach(element => { 

      const paints = element.paints[0]['color'];
      const hex = rgbToHex(paints.r, paints.g, paints.b);

      const colorObj = {
        [element.name]: {
          rgb: element.paints[0]['color'],
          hex: hex,
          type: element.paints[0].type,
          opacity: element.paints[0].opacity,
        }
      };
      Object.assign(palette, colorObj);
    });

    textStyles.forEach(element => { 
      const textObj = {
        [element.name]: {
          fontFamily: element.fontName.family,
          fontWeight: element.fontName.style,
          fontSize: element.fontSize,
          type: element.type,
          letterSpacing: element.letterSpacing,
          lineHeight: element.lineHeight,
        }
      };
        Object.assign(typography, textObj);
    });
    

    // gridStyles.forEach(element => { 
    //   console.log(element);
    //   const gridObj = {
    //     [element.name]: {
    //       value: element.layoutGrids[0].sectionSize,
    //       pattern: element.layoutGrids[0].pattern,
    //       //gutter: element.layoutGrids[0].gutterSize,
             //gutter: `${element.layoutGrids[0].gutterSize}px`,
    //       //alignment: element.layoutGrids.alignment,
    //       // opacity: element.paints[2],
    //     }
    //   };
    //   Object.assign(grids, gridObj);
    // });


    const rootNode = figma.root;

    var spacerPage;
    var spacersObj;
    rootNode.children.forEach( element => {
      if(element.name === "Spacing"){
        spacerPage = element;
       spacersObj = getSpacingStyles(element);
      }
      Object.assign(spacing, spacersObj);
    })

    var baseTokeensJSON = {
      style: {
          colors: {},
          typography: {},
          spacing: {},
          //grids: {},
      }
    };
    Object.assign(baseTokeensJSON.style.colors, palette);
    Object.assign(baseTokeensJSON.style.typography, typography);
    Object.assign(baseTokeensJSON.style.spacing, spacing );

    figma.ui.postMessage(baseTokeensJSON);
  };


  if (msg.type === 'cancel'){
    figma.closePlugin();
  };

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  //figma.closePlugin();
};


function createJSONStyle(data, page) {
  var i = 0;

  var d = JSON.parse(data);

  //creating rectangles and text nodes to display colour information
  var cd = d.style.color
  for (var key in cd) {
    var item = cd[key];

     //create Text
     const txt = figma.createText();
     txt.name = "Text - " + key;
     txt.y = i * 110 + 40;
     txt.x = i + 110;
     txt.characters = key;

     //create rects
     const rect = figma.createRectangle();
     var col = hexToRgb(item.value);

     var f = clone(rect.fills)

     for( var v in col){
      col[v] = (col[v]/255).valueOf();
     }

     f[0].color.r = col.r;
     f[0].color.g = col.g;
     f[0].color.b = col.b;

     rect.fills = f

     rect.y = i * 110;
     //set Name
     rect.name = key;
     rect.cornerRadius = 10;

     page.appendChild(rect);
     page.appendChild(txt);

    i++;

  }

  //creating text nodes for text styles
  var j = 0;
  var td = d.style.typography;
  for (var key in td) {
    //style tokens
    var item = td[key];
    
    //create text
    const txt = figma.createText();
    txt.name = key;
    txt.y = j * 50;
    txt.x = j + 500;

    async function loadF() {
      let promise = figma.loadFontAsync({ family: `${item.fontName.value}`, style: "Regular" })
      let result = await promise;
      let font = { family: `${item.fontName.value}`, style: "Regular" };
      return txt.fontName = font;
    }

    loadF();
    txt.characters = key;
    txt.fontSize = item.size.value;

    //txt.letterSpacing = item.letterSpacing.unit;
    // txt.lineHeight = item.lineHeight;
    //txt.fills = element.paints;

    page.appendChild(txt);
    j++;

  }

};


// creating Fill Styles inside Figma on Style Guide Page
function createFillStyles(fillStyle, styleGuide) {
  var i = 0;

   fillStyle.forEach(element => {

     //create Text
     const txt = figma.createText();
     txt.name = "Text - " + element.name;
     txt.y = i * 110 + 40;
     txt.x = i + 110;
     txt.characters = element.name;

     //create rects
     const rect = figma.createRectangle();
     rect.fills = element.paints;
     rect.y = i * 110;

     //set Name
     rect.name = element.name;
     rect.cornerRadius = 10;

     styleGuide.appendChild(rect);
     styleGuide.appendChild(txt);

     i++;
   });
};


// creating Text Styles inside Figma on Style Guide Page
function createTextStyles(textStyle, styleGuide) {
  var j = 0;
  textStyle.forEach(element => {

    //create Text
    const txt = figma.createText();
    txt.name = element.name;
    txt.y = j * 50;
    txt.x = j + 500;

    async function f() {
      let promise = figma.loadFontAsync(element.fontName)
      let result = await promise;
      console.log(element.fontName);
      return txt.fontName = element.fontName;
      
    }

    f();

    txt.characters = element.name;
    txt.fontSize = element.fontSize;
    txt.letterSpacing = element.letterSpacing;
    txt.lineHeight = element.lineHeight;
    //txt.fills = element.paints;

    styleGuide.appendChild(txt);

    j++;
  });
};

// Extracting and mapping spacing Styles to write to a JSON object
function getSpacingStyles(spacingPage) {
  const spacers = {};
  const spacersObj = spacingPage.children[0].children;
  spacersObj.map(item => {
    const spacerObj = {
      [item.name]: {
          width: `${item.width}px`,
          height: `${item.height}px`,
          type: "spacing",
          value: `${item.width}px`,
      }
    };
    Object.assign(spacers, spacerObj);
  });
  return spacers;
}


//additional Functions to help
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r,g,b) {
  const rr = Math.round(r * 255);
  const gg = Math.round(g * 255);
  const bb = Math.round(b * 255);

  r = rr.toString(16);
  g = gg.toString(16);
  b = bb.toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}

//alert(rgbToHex(0, 51, 255)); // #0033ff

function clone(val) {
  return JSON.parse(JSON.stringify(val))
}
