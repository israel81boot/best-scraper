var axios = require('axios');
var cheerio = require('cheerio');
var path = require('path');

module.exports = function (app, db) {

  app.get('/', (req, res) => {
    console.log('Home Okay');
    res.sendFile(__dirname, './index.html');
  });

  //Grabbing recent articles about technology from the NewYorkTimes
  app.get("/api/scrape", function (req, res) {

    return axios.get("http://www.nytimes.com").then(function(res) {
      var $ = cheerio.load(res.data);
      console.log("scraping");
      // Make an empty array to save our article info
      var articles = [];
  
      // Now, find and loop through each element that has the ".assetWrapper" class
      // (i.e, the section holding the articles)
      $(".assetWrapper").each(function(i, element) {
        // In each article section, we grab the headline, URL, and summary
  
        // Grab the headline of the article
        var head = $(this)
          .find("h2")
          .text()
          .trim();
  
        // Grab the URL of the article
        var url = $(this)
          .find("a")
          .attr("href");
  
        // Grab the summary of the article
        var sum = $(this)
          .find("p")
          .text()
          .trim();
  
        // So long as our headline and sum and url aren't empty or undefined, do the following
        if (head && sum && url) {
          // This section uses regular expressions and the trim function to tidy our headlines and summaries
          // We're removing extra lines, extra spacing, extra tabs, etc.. to increase to typographical cleanliness.
          var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
          var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
  
          // Initialize an object we will push to the articles array
          var dataToAdd = {
            title: headNeat,
            summary: sumNeat,
            link: "https://www.nytimes.com" + url
          };

          db.Articles.create(dataToAdd)
          .then(function (dbArticle) {
            // console.log(dbArticle);
          })
          .catch(function (err) {
            console.log(err);
          });
  
          // Push new article into articles array
          articles.push(dataToAdd);
        }
      });
      return articles;
    });
  });

  //Getting all Articles from the db
  app.get("/articles", function (req, res) {
    db.Articles.find({})
      .then(function (dbArticle) {
        res.json(dbArticle);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/api/articles/:id", function (req, res) {
    db.Articles.findOne({ _id: req.params.id })
      // .populate("note")
      .then(function (dbArticle) {
        res.json(dbArticle);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  //Clearing the db: Caution!!!!
  app.get('/clear', function (req, res) {
    db.Articles.remove({}, function (err) {
      console.log('articles' + err);
    });
    db.Notes.remove({}, function (err) {
      console.log('Notes' + err);
    });
    res.json("Database Cleared!!!")
  });

  //Saving Article
  app.post('/api/save', function(req, res){
    console.log(req.body._id);
    var test = db.SavedArticle.findOne({_id: req.body._id})
    .then(function(){
      if(test.name === undefined){
      db.SavedArticle.create(req.body)
      .then(function(){
        res.send("Article Saved!");
      });
    }else  if(test.name !== undefined){
      res.send("You have already saved this articles!");
    }
    }); 
    
  });

  // Grabbing Saved Article
  app.get("/api/saved", function(req, res){
    db.SavedArticle.find({})
      .then(function (dbArticle) {
        res.json(dbArticle);
      })
      .catch(function (err) {
        res.json(err);
      });
  })


  // Saving/updating an Article's associated Note
  app.post("/articles/:id", function (req, res) {
    db.Notes.create(req.body)
      .then(function (dbNote) {
        return db.Articles.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function (dbArticle) {
        res.json(dbArticle);
      })
      .catch(function (err) {
        res.json(err);
      });
  });


    



} 

