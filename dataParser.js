function DataParser() {

}

DataParser.prototype.parse = function(data, seasonNumber) {
  var allStarsSeasons = this.seasonSeparator(data)[0]
  var regularSeasons = this.seasonSeparator(data)[1]
  var allStarsCompetitors = this.allStarsPlacementLookup(allStarsSeasons)
  var allStarsInRegSeason = this.regularPlaceLookup(allStarsCompetitors, regularSeasons)
  var selectedCompetitors = this.seasonSelector(allStarsCompetitors, seasonNumber)
  var queensInBuckets = this.bucketBuilder(selectedCompetitors)
  var nodes = this.nodeBuilder(queensInBuckets)
  var links = this.linkBuilder(queensInBuckets, nodes)
  var formattedJSON = this.nodeToLinkMerger(links, nodes)
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
      allStarsSeasons[i]["queens"][j].allStarsSeasonNumber = allStarsSeasons[i].seasonNumber
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

DataParser.prototype.seasonSelector = function(allStars, seasonNumber) {
  var selectedQueens = []
  var unselectedQueens = []
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    if (seasonNumber == "AA") {
      selectedQueens.push(queen)
    } else if (queen.allStarsSeasonNumber == seasonNumber) {
      selectedQueens.push(queen)
    } else {
      unselectedQueens.push(queen)
    }
  }
  return selectedQueens
}

DataParser.prototype.bucketBuilder = function(allStars) {
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    if (queen.allStarsPlace == 1) {
      queen.allStarsPlaceBucket = "AS Winner"
    } else if (queen.allStarsPlace <= 4) {
      queen.allStarsPlaceBucket = "AS Runner-Up"
    } else if (queen.allStarsPlace > 7) {
      queen.allStarsPlaceBucket = "AS Bottom Half"
    } else {
      queen.allStarsPlaceBucket = "AS Top Half"
    }
    if (queen.regularPlace == 1) {
      queen.regularPlaceBucket = "Original Season Winner"
    } else if (queen.regularPlace <= 4) {
      queen.regularPlaceBucket = "Original Season Runner-Up"
    } else if (queen.regularPlace > 7) {
      queen.regularPlaceBucket = "Original Season Bottom Half"
    } else {
      queen.regularPlaceBucket = "Original Season Top Half"
    }
  }
  return allStars
}

DataParser.prototype.nodeBuilder = function(allStars) {
  var buckets = []
  var nodes = []
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    buckets.push(queen.regularPlaceBucket)
    buckets.push(queen.allStarsPlaceBucket)
  }
  var uniqueBuckets = Array.from(new Set(buckets))
  for (var i = 0; i < uniqueBuckets.length; i++) {
    var node = uniqueBuckets[i]
    nodes.push({"name": node})
  }
  return nodes
}

DataParser.prototype.linkBuilder = function(allStars, nodes) {
  var links = []
  console.log("entering the loop")

  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    console.log("on queen " + queen.name)
    for (var j = 0; j < nodes.length; j++) {
      var node = nodes[j]
      var bucketName = node.name
      if (queen.regularPlaceBucket === bucketName) {
        queen.source = j
      } else if (queen.allStarsPlaceBucket ===  bucketName) {
        queen.target = j
      }
    }
    var newLink = {
      "source":queen.source,
      "target":queen.target,
      "value":2,
      "queen":queen.name,
      "originalSeasonPlace":queen.regularPlace,
      "allStarsPlace":queen.allStarsPlace
    }
    links.push(newLink)
  }
  return links
}


DataParser.prototype.nodeToLinkMerger = function(links, nodes) {
  var formattedJSON = {
    "nodes":nodes,
    "links":links
  }
  return formattedJSON
}
