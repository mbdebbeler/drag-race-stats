function DataParser(queenData) {
  this.queenData = queenData
}

DataParser.prototype.parse = function(seasonData, userInput) {
  var groupingCode = userInput

// separate data for seasons of All Stars from data for Regular Seasons
  var allStarsSeasonsData = this.seasonSeparator(seasonData)[0]
  var regularSeasonsData = this.seasonSeparator(seasonData)[1]

// create All-All Stars Roster from all competitors in All Stars seasons
  var allStarsCompetitors = this.allStarsPlacementLookup(allStarsSeasonsData)
// pull data about All Stars Competitors performance in regular seasons
  var allStarsInRegSeason = this.regularPlaceLookup(allStarsCompetitors, regularSeasonsData)
// cull list of competitors for SVG with user input
  var selectedCompetitors = this.rosterBuilder(allStarsInRegSeason, groupingCode)

// add image urls and Miss Congeniality data to roster of selected competitors
  this.addImagesToQueens(selectedCompetitors)
  this.addMissCongenialityToQueens(selectedCompetitors)

// create buckets for queens
  var queensInBuckets = this.bucketBuilder(selectedCompetitors, groupingCode)

// build nodes and links from buckets, merge them, return the formatted JSON
  var nodes = this.nodeBuilder(queensInBuckets)
  var links = this.linkBuilder(queensInBuckets, nodes)
  var formattedJSON = this.nodeToLinkMerger(links, nodes, groupingCode)
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
    var regularSeasonNumber
    var regularSeasonPlace
    var queen = allStarsCompetitors[i]
    var queenID = allStarsCompetitors[i].id
    for (j = 0; j < regularSeasons.length; j++) {
      regularSeasonNumber = regularSeasons[j].seasonNumber
      var foundQueens = regularSeasons[j].queens.filter(function(queen){
        return queen.id == queenID
      })
      if (foundQueens != []) {
        for (k = 0; k < foundQueens.length; k++) {
        queen.regularSeasonNumber = regularSeasonNumber
        queen.regularSeasonPlace = foundQueens[k].place
        allStarsInRegSeason.push(queen)
        }
      }
    }
  }
  return allStarsInRegSeason
}

DataParser.prototype.rosterBuilder = function(allStars, groupingCode) {
  var selectedQueens = []
  var unselectedQueens = []
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    if (groupingCode == "AA" || groupingCode == "MC" || groupingCode == "RS") {
      selectedQueens.push(queen)
    } else if (queen.allStarsSeasonNumber == groupingCode) {
      selectedQueens.push(queen)
    } else {
      unselectedQueens.push(queen)
    }
  }
  return selectedQueens
}


DataParser.prototype.bucketBuilder = function(allStars, groupingCode) {
    switch(groupingCode) {
    case "AA":
    case "A1":
    case "A2":
    case "A3":
    case "A4":
      return this.regSeasonPlaceVsAllStarsPlace(allStars)
      break;
    case "MC":
      return this.missCongenialityVsAllStarsPlace(allStars)
      break;
    case "RS":
      return this.regSeasonNumberVsAllStarsPlace(allStars)
      break;
    default:
      return this.regSeasonPlaceVsAllStarsPlace(allStars)
  }
}

DataParser.prototype.regSeasonNumberVsAllStarsPlace = function(allStars, groupingCode) {
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    if (queen.allStarsPlace == 1) {
      queen.rightBucket = {bucket:"All Stars Winner", sortPriority: "12"}
    } else if (queen.allStarsPlace <= 4) {
      queen.rightBucket = {bucket:"All Stars Runner-Up", sortPriority: "13"}
    } else if (queen.allStarsPlace > 7) {
      queen.rightBucket = {bucket:"All Stars Bottom Half", sortPriority: "15"}
    } else {
      queen.rightBucket = {bucket:"All Stars Top Half", sortPriority: "14"}
    }
    queen.leftBucket = {bucket: "Season " + queen.regularSeasonNumber, sortPriority: queen.regularSeasonNumber}
  }
  return allStars
}

DataParser.prototype.missCongenialityVsAllStarsPlace = function(allStars, groupingCode) {
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    if (queen.allStarsPlace == 1) {
      queen.rightBucket = {bucket:"All Stars Winner", sortPriority: "3"}
    } else if (queen.allStarsPlace <= 4) {
      queen.rightBucket = {bucket:"All Stars Runner-Up", sortPriority: "4"}
    } else if (queen.allStarsPlace > 7) {
      queen.rightBucket = {bucket:"All Stars Bottom Half", sortPriority: "6"}
    } else {
      queen.rightBucket = {bucket:"All Stars Top Half", sortPriority: "5"}
    }
    if (queen.missCongeniality === true) {
      queen.leftBucket = {bucket:"Miss Congeniality in Original Season", sortPriority: "1"}
    } else {
      queen.leftBucket = {bucket:"not Miss Congeniality in Original Season", sortPriority: "2"}
    }
  }
  return allStars
}

DataParser.prototype.regSeasonPlaceVsAllStarsPlace = function(allStars) {
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    if (queen.allStarsPlace == 1) {
      queen.rightBucket = {bucket:"All Stars Winner", sortPriority: "5"}
    } else if (queen.allStarsPlace <= 4) {
      queen.rightBucket = {bucket:"All Stars Runner-Up", sortPriority: "6"}
    } else if (queen.allStarsPlace > 7) {
      queen.rightBucket = {bucket:"All Stars Bottom Half", sortPriority: "8"}
    } else {
      queen.rightBucket = {bucket:"All Stars Top Half", sortPriority: "7"}
    }
    if (queen.regularSeasonPlace == 1) {
      queen.leftBucket = {bucket:"Original Season Winner", sortPriority: "1"}
    } else if (queen.regularSeasonPlace <= 4) {
      queen.leftBucket = {bucket:"Original Season Runner-Up", sortPriority: "2"}
    } else if (queen.regularSeasonPlace > 7) {
      queen.leftBucket = {bucket:"Original Season Bottom Half", sortPriority: "4"}
    } else {
      queen.leftBucket = {bucket:"Original Season Top Half", sortPriority: "3"}
    }
  }
  return allStars
}


DataParser.prototype.nodeBuilder = function(allStars) {
  var buckets = []
  var nodes = []
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    buckets.push(queen.leftBucket)
    buckets.push(queen.rightBucket)
  }
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
  return this.queenData.find(queen => queen.id === id).image_url;
}

DataParser.prototype.addMissCongenialityToQueens = function(queens) {
  queens.forEach(queen => {
    var id = queen.id
    queen.missCongeniality = this.getMissCongenialityForQueen(id)
  })
}

DataParser.prototype.getMissCongenialityForQueen = function(id) {
  return this.queenData.find(queen => queen.id === id).missCongeniality;
}

DataParser.prototype.linkBuilder = function(allStars, nodes) {
  var links = []
  for (var i = 0; i < allStars.length; i++) {
    var queen = allStars[i]
    for (var j = 0; j < nodes.length; j++) {
      var node = nodes[j]
      var bucketName = node.name
      if (queen.leftBucket.bucket === bucketName) {
        queen.source = j
      } else if (queen.rightBucket.bucket ===  bucketName) {
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


DataParser.prototype.nodeToLinkMerger = function(links, nodes, groupingCode) {
  var formattedJSON = {
    "nodes":nodes,
    "links":links
  }
  return formattedJSON
}
