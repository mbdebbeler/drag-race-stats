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
      $('.collapsible').collapsible();
      $('.dropdown-trigger').dropdown();
      $('.modal').modal();
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
  this.showGraph()
}

Controller.prototype.bindEvents = function() {
  $('.nav-content a').click(function() {
    var selectedGroup = $(event.target).data("id")
    this.changeGraph(selectedGroup)
    this.hideAboutCard()
    this.showGraph()
  }.bind(this));
  $('.nav-wrapper .link-button').click(function() {
    var selectedGroup = $(event.target).data("id")
    this.changeGraph(selectedGroup)
    this.hideAboutCard()
    this.showGraph()
  }.bind(this));
  $('.view-about-card').click(function(){
    this.hideGraph()
    this.showAboutCard()
  }.bind(this));
}

Controller.prototype.hideNav = function() {
  var hideNav = $('#hide-drop-nav')
  if (hideNav !== undefined) {
    $('.nav-content').addClass("hidden")
  } else {
    $('.nav-content').removeClass("hidden")
  }
}

Controller.prototype.hideGraph = function() {
  $('#wrapper').addClass("hidden")
}

Controller.prototype.showGraph = function() {
  $('#wrapper').removeClass("hidden")
}

Controller.prototype.hideAboutCard = function() {
  $('#about-card').addClass("hidden")
}

Controller.prototype.showAboutCard = function() {
  $('#about-card').removeClass("hidden")
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
