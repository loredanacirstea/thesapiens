/**
 * Originally grabbed from the official RaphaelJS Documentation
 * http://raphaeljs.com/graffle.html
 * Adopted (arrows) and commented by Philipp Strathausen http://blog.ameisenbar.de
 * Licenced under the MIT licence.
 */

/**
 * Usage:
 * connect two shapes
 * parameters:
 *      source shape [or connection for redrawing],
 *      target shape,
 *      style with { fg : linecolor, bg : background color, directed: boolean }
 * returns:
 *      connection { draw = function() }
 */
 var temp = {}

function Connection(canvas, obj1, obj2, style) {
  this.canvas = canvas;
  this.obj1 = obj1;
  this.obj2 = obj2;
  this.style=style;
  var selfRef = this;
  //console.dir(id2)
  //var obj1 = nodes[id1+""][0];
  //var obj2 = nodes[id2+""][0];
  /* create and return new connection */
  var edge = {/*
    from : obj1,
    to : obj2,
    style : style,*/
    draw : function() {
      /* get bounding boxes of target and source */
      if (selfRef.done ) selfRef.fg.remove()
      selfRef.fg = false
      var bb1 = selfRef.obj1.getBoundingRect();
      var bb2 = selfRef.obj2.getBoundingRect();
      var off1 = 0;
      var off2 = 0;
      /* coordinates for potential connection coordinates from/to the objects */
      var p = [
        /* NORTH 1 */
        { x: bb1.left + bb1.width / 2, y: bb1.top - off1 },
        /* SOUTH 1 */
        { x: bb1.left + bb1.width / 2, y: bb1.top + bb1.height + off1 },
        /* WEST */
        { x: bb1.left - off1, y: bb1.top + bb1.height / 2 },
        /* EAST  1 */
        { x: bb1.left + bb1.width + off1, y: bb1.top + bb1.height / 2 },
        /* NORTH 2 */
        { x: bb2.left + bb2.width / 2, y: bb2.top - off2 },
        /* SOUTH 2 */
        { x: bb2.left + bb2.width / 2, y: bb2.top + bb2.height + off2 },
        /* WEST  2 */
        { x: bb2.left - off2, y: bb2.top + bb2.height / 2 },
        /* EAST  2 */
        { x: bb2.left + bb2.width + off2, y: bb2.top + bb2.height / 2 }
      ];
      //console.log(p)
      
      /* distances between objects and according coordinates connection */
      var d = {}, dis = [];

      /*
       * find out the best connection coordinates by trying all possible ways
       */
      /* loop the first object's connection coordinates */
      for (var i = 0; i < 4; i++) {
        /* loop the seond object's connection coordinates */
        for (var j = 4; j < 8; j++) {
          var dx = Math.abs(p[i].x - p[j].x);
          var dy = Math.abs(p[i].y - p[j].y);
          if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x)
                && ((i != 2 && j != 7) || p[i].x > p[j].x)
                && ((i != 0 && j != 5) || p[i].y > p[j].y)
                && ((i != 1 && j != 4) || p[i].y < p[j].y)))
          {
            dis.push(dx + dy);
            d[dis[dis.length - 1].toFixed(3)] = [i, j];
          }
        }
      }
      var res = dis.length == 0 ? [0, 4] : d[Math.min.apply(Math, dis).toFixed(3)];
      /* bezier path */
      var x1 = p[res[0]].x,
          y1 = p[res[0]].y,
          x4 = p[res[1]].x,
          y4 = p[res[1]].y,
          dx = Math.max(Math.abs(x1 - x4) / 2, 10),
          dy = Math.max(Math.abs(y1 - y4) / 2, 10),
          x2 = [ x1, x1, x1 - dx, x1 + dx ][res[0]].toFixed(3),
          y2 = [ y1 - dy, y1 + dy, y1, y1 ][res[0]].toFixed(3),
          x3 = [ 0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx ][res[1]].toFixed(3),
          y3 = [ 0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4 ][res[1]].toFixed(3);
      /* assemble path and arrow */

      var path = [ "M" + x1.toFixed(3), y1.toFixed(3),
          "C" + x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3) ].join(",");
      /* arrow */
      if(style && style.directed) {
        // magnitude, length of the last path vector 
        var mag = Math.sqrt((y4 - y3) * (y4 - y3) + (x4 - x3) * (x4 - x3));
        // vector normalisation to specified length  
        var norm = function(x,l){return (-x*(l||5)/mag);};
        // calculate array coordinates (two lines orthogonal to the path vector) 
        var arr = [
          { x:(norm(x4-x3)+norm(y4-y3)+x4).toFixed(3),
            y:(norm(y4-y3)+norm(x4-x3)+y4).toFixed(3) },
          { x:(norm(x4-x3)-norm(y4-y3)+x4).toFixed(3),
            y:(norm(y4-y3)-norm(x4-x3)+y4).toFixed(3) }
        ];
        path = path + ",M" + arr[0].x + "," + arr[0].y + ",L" + x4 + "," +
          y4 + ",L" + arr[1].x + "," + arr[1].y;
      }
      /* function to be used for moving existent path(s), e.g. animate() or attr() */
      var move = "set";
      /* applying path(s) */
      //var color = Raphael.getColor();
      //alert(path)
      var color = "#555";
      //edge.fg //&& edge.fg[move]({path:path})
          //|| 
          (selfRef.fg = new fabric.Path(path)
              .set({ stroke: style && style.stroke || "#000", 
                fill: "transparent", strokeWidth: style.strokeWidth, 
                lockScalingX: true, lockScalingY: true, perPixelTargetFind:true,
                stroke: selfRef.style.stroke, selectable:false,opacity:.5,originX: "center",originY: "center"})
              //.setShadow('3px 3px 10px rgba(0,0,0,0.3)')
              );
      //this.show
          /*
      edge.bg //&& edge.bg[move]({path:path})
          || style && style.fill && (edge.bg = style.fill.split
              && new fabric.Path(path)
              .set({ stroke: style.fill.split("|")[0], fill: "none", stroke: color,
                "stroke-width": style.fill.split("|")[1] || 3 }));
*/
      //edge.control && edge.control[move]({path:path}) || 
      selfRef.canvas.add(selfRef.fg)
      selfRef.done = true
      if (false) {
        selfRef.control = new fabric.Circle({radius: 3.5,fill:"#111",left:(x1+x4)/2,top:(y1+y4)/2, selectable:false})
        canvas.add(selfRef.control)
        //edge.control.node.style.cursor = "move"
        //edge.control.toFront()
        //console.log(nodes[id1+""])
        /*
        edge.control.dblclick(
          function () {
            //
            var fields = {source: id1, target: id2, 'graph_id': graph_id}
            alert(this.id)
            
            $.post( "../smpg_up.php", {entity:"connect", id:this.id})
              .done(function( data) {
              //id=data[0]
              //window.location.href = "test.php?lang=en&id="+temp;
            });


            
              $.post( "../smpg_up.php", {"entity":"node","fields":{"intltext":1001,"node_type":"connect", "graph_id":graph_id}})
              .done(function( data ) {
                id3=data[0]
                temp=id3;
                $.post( "../smpg_up.php", {"entity":"connect","fields":{"source":id1,"target":temp,"graph_id":graph_id}})
                .done(function( data) {
                  $.post( "../smpg_up.php", {"entity":"connect","fields":{"source":temp,"target":id2,"graph_id":graph_id}})
                  .done(function( data) {
                    id=data[0]
                    window.location.href = "index.php?lang=en&id="+graph_id;
                  });
                });
              });
           



          }

      )
*/
      } else {
        //edge.control.transform("t"+(x1+x4-30)/2+","+(y1+y4-30)/2)
        //selfRef.control.set({left:(x1+x4)/2,top:(y1+y4)/2})
        //selfRef.control.bringToFront()
      }
      //alert("ji")
      //console.dir(edge.control)


      /* setting label */
      style && style.label
          && (selfRef.label && selfRef.label.set({left:(x1+x4)/2+8, top:(y1+y4)/2-8})
              || (selfRef.label = new fabric.Text( style.label)
                .set({selectable:false,fontFamily:"sans-serif",fontSize:12,top: (x1+x4)/2+8, left: (y1+y4)/2-8 ,fill: "#555", "font-size": style["font-size"] || "12px"})));
      style && style.label && style["label-style"] && selfRef.label
        && selfRef.label.set(style["label-style"]);
      style && style.callback && style.callback(edge);
      if (!selfRef.l) {selfRef.canvas.add(selfRef.label); selfRef.l = true}
    }
  }
  edge.draw();
  return edge;
};