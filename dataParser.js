function DataParser(queenData) {
  this.queenData = queenData
}

DataParser.prototype.parse = function(seasonData, seasonNumber) {
  var allStarsSeasons = this.seasonSeparator(seasonData)[0]
  var regularSeasons = this.seasonSeparator(seasonData)[1]
  var allStarsCompetitors = this.allStarsPlacementLookup(allStarsSeasons)
  var allStarsInRegSeason = this.regularPlaceLookup(allStarsCompetitors, regularSeasons)
  var selectedCompetitors = this.seasonSelector(allStarsCompetitors, seasonNumber)
  this.addImagesToQueens(selectedCompetitors)
  var queensInBuckets = this.bucketBuilder(selectedCompetitors)
  var nodes = this.nodeBuilder(queensInBuckets)
  var links = this.linkBuilder(queensInBuckets, nodes)
  var formattedJSON = this.nodeToLinkMerger(links, nodes, seasonNumber)
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
      queen.allStarsPlaceBucket = {bucket:"AS Winner", sortPriority: "5"}
    } else if (queen.allStarsPlace <= 4) {
      queen.allStarsPlaceBucket = {bucket:"AS Runner-Up", sortPriority: "6"}
    } else if (queen.allStarsPlace > 7) {
      queen.allStarsPlaceBucket = {bucket:"AS Bottom Half", sortPriority: "8"}
    } else {
      queen.allStarsPlaceBucket = {bucket:"AS Top Half", sortPriority: "7"}
    }
    if (queen.regularPlace == 1) {
      queen.regularPlaceBucket = {bucket:"Original Season Winner", sortPriority: "1"}
    } else if (queen.regularPlace <= 4) {
      queen.regularPlaceBucket = {bucket:"Original Season Runner-Up", sortPriority: "2"}
    } else if (queen.regularPlace > 7) {
      queen.regularPlaceBucket = {bucket:"Original Season Bottom Half", sortPriority: "4"}
    } else {
      queen.regularPlaceBucket = {bucket:"Original Season Top Half", sortPriority: "3"}
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
  // var uniqueBuckets = Array.from(new Set(buckets))
  function getUnique(arr, comp) {
    const unique = arr
         .map(e => e[comp])
         .map((e, i, final) => final.indexOf(e) === i && i)
         .filter(e => arr[e]).map(e => arr[e]);
     return unique;
  }
  var uniqueBuckets = getUnique(buckets,'bucket')
  for (var i = 0; i < uniqueBuckets.length; i++) {
    var node = uniqueBuckets[i]
    nodes.push({"name": node.bucket, "sortPriority": node.sortPriority})
  }
  nodes.sort(function(a, b){return a.sortPriority - b.sortPriority});
  return nodes
}

DataParser.prototype.addImagesToQueens = function(queens) {
  queens.forEach(queen => {
    var id = queen.id
    queen.imageUrl = this.getImageForQueen(id)
  })
}

DataParser.prototype.getImageForQueen = function(id) {
  // return this.queenData.find(function(queen) { queen.id === id}).image_url;
  // return this.queenData.find(queen => {
  //   queen.id === id
  // }).image_url;
  return this.queenData.find(queen => queen.id === id).image_url;
}

DataParser.prototype.linkBuilder = function(allStars, nodes) {
  var links = []
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    for (var j = 0; j < nodes.length; j++) {
      var node = nodes[j]
      var bucketName = node.name
      if (queen.regularPlaceBucket.bucket === bucketName) {
        queen.source = j
      } else if (queen.allStarsPlaceBucket.bucket ===  bucketName) {
        queen.target = j
      }
    }
    var newLink = {
      "source":queen.source,
      "target":queen.target,
      "queenID":queen.id,
      "imageUrl":queen.imageUrl,
      "value":2,
      "queen":queen.name,
      "originalSeasonPlace":queen.regularPlace,
      "allStarsPlace":queen.allStarsPlace
    }
    links.push(newLink)
  }
  links.sort((a, b) => (a.originalSeasonPlace < b.originalSeasonPlace) ? 1 : -1);
  return links
}


DataParser.prototype.nodeToLinkMerger = function(links, nodes, seasonNumber) {
  var formattedJSON = {
    "nodes":nodes,
    "links":links
  }
  return formattedJSON
}
