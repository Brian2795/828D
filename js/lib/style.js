var style;

// this is a wrapped function
(function () {

  // the variables declared here will not be scoped anywhere and will only be accessible in this wrapped function
  var defaultColor = "white",
    highlightColor = "#FEFFD5";

  style = {
    navitem: {
      base: {
        font: '30pt TheMinion',
        align: 'left',
        strokeThickness: 4
      },
      subtitle: {
        font: '13pt Coolvetica',
        align: 'left',
        strokeThickness: 2,
        fill: defaultColor
      },
      default: {
        fill: defaultColor,
        stroke: 'rgba(0,0,0,0)'
      },
      hover: {
        fill: highlightColor,
        stroke: 'rgba(200,200,200,0.5)'
      }
    },
    basiclabel: {
        default: {
            font: '20pt Coolvetica',
            fill: defaultColor
        }
    },
    smallbasiclabel: {
      default: {
          font: '15pt Coolvetica',
          fill: defaultColor
      }
    },
    quote: {
        default: {
            font: '20pt Blacksword',
            fill: defaultColor
        }
    }
  };

  Object.assign(style.navitem.hover, style.navitem.base);
  Object.assign(style.navitem.default, style.navitem.base);

})();