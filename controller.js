$(document).ready(function(){
  var fetcher = new DataFetcher();
  fetcher.fetch("rawAPIpulls/getAllQueens.json", function(json){
    var parser = new DataParser(json);
    var view = new D3View();
    var controller = new Controller(fetcher, parser, view);
    controller.loadDefaultView();
    $("#header").load("header.html", function() {
      controller.bindEvents();
      $('.sidenav').sidenav();
    });
  });
});

function Controller(fetcher, parser, view) {
  this.fetcher = fetcher
  this.parser = parser
  this.view = view
}

Controller.prototype.loadDefaultView = function() {
  var defaultFile = "rawAPIpulls/getAllSeasons.json"
  this.drawGraph(defaultFile, "AA")
}

Controller.prototype.bindEvents = function() {
  $('.nav-content a').click(function() {
    var selectedGroup = $(event.target).data("id")
    this.changeGraph(selectedGroup)
  }.bind(this));
  $('.nav-wrapper a').click(function() {
    var selectedGroup = $(event.target).data("id")
    this.changeGraph(selectedGroup)
  }.bind(this));
}

Controller.prototype.hideNav = function() {
  var aboutCard = $('#about-card')
  if (aboutCard !== undefined) {
    $('.nav-content').addClass("hidden")
  } else {
    $('.nav-content').removeClass("hidden")
  }
}

Controller.prototype.changeGraph = function(selectedGroup) {
  var filename = "rawAPIpulls/getAllSeasons.json"
  this.drawGraph(filename, selectedGroup)
}

Controller.prototype.drawGraph = function(filename, selectedGroup) {
  this.fetcher.fetch(filename, function(json) {
    var parsedJSON = this.parser.parse(json, selectedGroup)
    this.view.updateJSON(parsedJSON)
  }.bind(this))
}
