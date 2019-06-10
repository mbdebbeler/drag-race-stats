function D3View() {
  // set the dimensions and margins of the graph
  this.margin = {top: 10, right: 10, bottom: 10, left: 10},
  this.width = 1000 - this.margin.left - this.margin.right,
  this.height = 600 - this.margin.top - this.margin.bottom;
  this.appendSVG()

  // format variables
  var units = "queens";
  var formatNumber = d3.format(",.0f")    // zero decimal places
  this.format = function(d) { return formatNumber(d) + " " + units; }
  this.color = d3.scaleLinear()
    .domain([0, 7])
    .range(["#1EC5B9", "#E9B01C"]);

  // set the sankey diagram properties
  this.sankey = d3.sankey()
  .nodeWidth(30)
  .nodePadding(40)
  .size([this.width, this.height]);
  this.path = this.sankey.link();

  //set svg properties and append the sankey
  this.svg = d3.select("svg")
  .attr("width", this.width + this.margin.left + this.margin.right)
  .attr("height", this.height + this.margin.top + this.margin.bottom)
  .append("g")
}

D3View.prototype.drawSankey = function(graph) {
  this.sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

// build tooltips for link hover behavior
      var tooltip = d3.select("#wrapper")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
          .style("width","120px")
          .style("height","120px")
          .style("padding","2px")
          .style("text-align","center")
          .style("font-size","10px")
          .style("border","0px")
      .style("visibility", "hidden");

// add in the links and attach tooltips
  var link = this.svg.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", this.path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; })
      .on("mouseover", function(d){
            var imgName = d.imageUrl
            tooltip.text(d.queen);
            tooltip
              .append("div")
              .style("position", "inline-block")
              .attr("x", 0)
              .attr("y", 0)
              .style("width","100%")
              .style("height","100%")
              .style("border-radius","16px")
                    .style("background-image", "url("+imgName+")", )
                    .style("background-size", "100%")
                    .style("background-repeat", "no-repeat")
            tooltip.style("visibility", "visible")
        })
      .on("mousemove", function(){
        var x = event.pageX - $('#wrapper').offset().left + 10;
        var y = event.pageY - $('#wrapper').offset().top + 10;
        return tooltip
        .style("top", y+"px")
        .style("left", x+"px");
      })

      .on("mouseout", function(){
        return tooltip.style("visibility", "hidden");
      });

// add in the nodes
  var node = this.svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.drag()
        .subject(function(d) {
          return d;
        })
        .on("start", function() {
          this.parentNode.appendChild(this);
        })
        .on("drag", dragmove));

      var color = this.color
      var format = this.format

// add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", this.sankey.nodeWidth())
      .style("fill", function(d) {
      return d.color = color(d.sortPriority); })
    .append("title")
      .text(function(d) {
      return d.name + "\n" + format(d.value); });

var width = this.width
// add in the title for the nodes
  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + this.sankey.nodeWidth())
      .attr("text-anchor", "start");

      // the function for moving the nodes
      var view = this;
      function dragmove(d) {
        d3.select(this)
        .attr("transform",
        "translate("
        + d.x + ","
        + (d.y = Math.max(
          0, Math.min(view.height - d.dy, d3.event.y))
        ) + ")");
        view.sankey.relayout();
        link.attr("d", view.path);
      }

}

D3View.prototype.clearSankey = function() {
  var elements = d3.selectAll("g > *")
  elements.remove();

}

D3View.prototype.updateJSON = function(json) {
  this.clearSankey();
  this.drawSankey(json);
}

D3View.prototype.appendSVG = function() {
  // append the svg object to the body of the page
  d3.select("#wrapper")
  .attr(
    "style",
    "padding-bottom: " + Math.ceil(this.height * 100 / this.width) + "%"
  )
  .append("svg")
  .attr("viewBox", "0 0 " + this.width + " " + this.height);
}
