function DataParser() {


}

DataParser.prototype.parse = function(data) {
  var allStarsSeasons = this.seasonSeparator(data)[0]
  var regularSeasons = this.seasonSeparator(data)[1]
  var allStarsCompetitors = this.allStarsPlacementLookup(allStarsSeasons)
  var allStarsInRegSeason = this.regularPlaceLookup(allStarsCompetitors, regularSeasons)
  var links = this.linkBuilder(allStarsCompetitors)
  var formattedJSON = this.nodeToLinkMerger(links)
  return formattedJSON
}

DataParser.prototype.seasonSeparator = function(data) {
  var allStarsSeasons = []
  var regularSeasons = []
  for (i = 0; i < data.length; i++) {
    regex = /([A])/g
    if (data[i].seasonNumber.match(regex)) {
      allStarsSeasons.push(data[i])
    } else {
      regularSeasons.push(data[i])
    }
  }
  return [allStarsSeasons, regularSeasons]
}

DataParser.prototype.allStarsPlacementLookup = function(allStarsSeasons) {
  var allStarsCompetitors = []
  for (i = 0; i < allStarsSeasons.length; i++) {
    for (j = 0; j < allStarsSeasons[i].queens.length; j++) {
      allStarsCompetitors.push(allStarsSeasons[i]["queens"][j])
    }
  }
  for (i = 0; i < allStarsCompetitors.length; i++) {
    var queen = allStarsCompetitors[i];
    queen.allStarsPlace = queen.place;
    delete queen.place;
  }
  return allStarsCompetitors
}

DataParser.prototype.regularPlaceLookup = function(allStarsCompetitors, regularSeasons) {
  var allStarsInRegSeason = []
  for (i = 0; i < allStarsCompetitors.length; i++) {
    var queen = allStarsCompetitors[i]
    var queenID = allStarsCompetitors[i].id
    for (j = 0; j < regularSeasons.length; j++) {
      var seasonNumber = regularSeasons[j].seasonNumber
      var foundQueens = regularSeasons[j].queens.filter(function(queen){
        queen.regularPlace = queen.place
        queen.seasonNumber = seasonNumber
        return queen.id == queenID
      })
      if (foundQueens != []) {
        for (k = 0; k < foundQueens.length; k++) {
        allStarsInRegSeason.push(foundQueens[k])
        queen.regularPlace = foundQueens[k].regularPlace
        }
      }
    }
  }
  return allStarsInRegSeason
}

DataParser.prototype.mergeQueens = function(regQueens, aSQueens) {
  function arrayUnion(arr1, arr2, equalityFunc) {
      var union = arr1.concat(arr2);

      for (var i = 0; i < union.length; i++) {
          for (var j = i+1; j < union.length; j++) {
              if (equalityFunc(union[i], union[j])) {
                  union.splice(j, 1);
                  j--;
              }
          }
      }

      return union;
  }

  function areQueensEqual(g1, g2) {
      return g1.id === g2.id;
  }

  var allStars = arrayUnion(regQueens, aSQueens, areQueensEqual);
}

DataParser.prototype.linkBuilder = function(allStars) {
  var links = []
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    if (queen.allStarsPlace == 1) {
      var target = 4
    } else if (queen.allStarsPlace <= 4) {
      var target = 5
    } else if (queen.allStarsPlace > 7) {
      var target = 7
    } else {
      var target = 6
    }
    if (queen.regularPlace == 1) {
      var source = 0
    } else if (queen.regularPlace <= 4) {
      var source = 1
    } else if (queen.regularPlace > 7) {
      var source = 3
    } else {
      var source = 2
    }
    var newLink = {"source":source, "target":target, "value":2, "queen":queen.name }
    links.push(newLink)
  }
  return links
}

DataParser.prototype.nodeToLinkMerger = function(links) {
  var formattedJSON = {
    "nodes":[
      {"node":0,"name":"Original Season Winner"},
      {"node":1,"name":"Original Season Runner-Up"},
      {"node":2,"name":"Original Season Top Half"},
      {"node":3,"name":"Original Season Bottom Half"},
      {"node":4,"name":"AS Winner"},
      {"node":5,"name":"AS Runner-Up"},
      {"node":6,"name":"AS Top Half"},
      {"node":7,"name":"AS Bottom Half"},
    ],
    "links":links
  }
  return formattedJSON
}
