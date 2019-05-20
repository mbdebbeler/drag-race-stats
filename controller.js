$(document).ready(function(){
  var fetcher = new DataFetcher();
  var parser = new DataParser();
  var view = new D3View();
  var controller = new Controller(fetcher, parser, view);
  controller.bindEvents();
  controller.drawGraph('models/AS4.json')
})

function Controller(fetcher, parser, view) {
  this.fetcher = fetcher
  this.parser = parser
  this.view = view
}

Controller.prototype.bindEvents = function() {
  $('h1').click(this.workingJSplease.bind(this));
  $('input').click(this.changeGraph.bind(this));
}

Controller.prototype.workingJSplease = function() {
  $('h1').addClass('pink')
}

Controller.prototype.changeGraph = function() {
  // TODO: read input to figure out filename
  var filename = "models/foo.json"
  this.drawGraph(filename)
}

Controller.prototype.drawGraph = function(filename) {
  this.fetcher.fetch(filename, function(json) {
    var parsedJSON = this.parser.parse(json)
    this.view.updateJSON(parsedJSON)
  }.bind(this))
}
