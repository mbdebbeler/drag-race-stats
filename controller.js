$(document).ready(function(){
  var fetcher = new DataFetcher();
  var parser = new DataParser();
  var view = new D3View();
  var controller = new Controller(fetcher, parser, view);
  controller.bindEvents();
  controller.fetcher.fetch('models/AS4.json', function(json) {
    view.drawSankey(json)
  })
})

function Controller(fetcher, parser, view) {
  this.fetcher = fetcher
  this.parser = parser
  this.view = view
}

Controller.prototype.bindEvents = function() {
  $('input').click(function() {
    var index = document.getElementById('selectedGroup').selectedIndex
    var selectedGroup = document.getElementById('selectedGroup').getElementsByTagName('option')[index].value
    this.changeGraph(selectedGroup)
  }.bind(this));
}

Controller.prototype.changeGraph = function(selectedGroup) {
  if (selectedGroup == "A4") {
    this.fetcher.fetch('models/AS4.json', function(json) {
      this.view.updateJSON(json)
    }.bind(this));
  } else {
    var filename = "rawAPIpulls/getAllSeasons.json"
    this.drawGraph(filename, selectedGroup)
  }
}

Controller.prototype.drawGraph = function(filename, selectedGroup) {
  this.fetcher.fetch(filename, function(json) {
    var parsedJSON = this.parser.parse(json, selectedGroup)
    debugger
    this.view.updateJSON(parsedJSON)
  }.bind(this))
}
