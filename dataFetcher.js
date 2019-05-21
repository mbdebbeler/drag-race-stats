function DataFetcher() {

}

DataFetcher.prototype.fetch = function(filename, callback) {
  $.getJSON(filename, callback);
}
