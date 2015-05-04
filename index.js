var http = require('http'),
    express = require('express'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    CollectionDriver = require('./collectionDriver').CollectionDriver;
 
var app = express();
app.set('port', process.env.PORT || 3000); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.bodyParser()); // <-- add

var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;
 
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
   //E
   //F
});

app.use(express.static(path.join(__dirname, 'public')));
 

 
app.get('/:collection/:database', function(req, res) { //A
    var params = req.params; //B
    var collection = req.params.collection
    var dataBase = req.params.database;
    var db = mongoClient.db(dataBase);
    collectionDriver = new CollectionDriver(db);
   collectionDriver.findAll(collection, function(error, objs) { //C
    	  if (error) { res.send(400, error); } //D
	      else { 
    	           res.set('Content-Type','application/json'); //G
                  res.send(200, objs);        
         }
   	});
});
 
app.get('/:collection/:database/:entity', function(req, res) { //I
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   var dataBase = req.params.database;
   var db = mongoClient.db(dataBase);
   collectionDriver = new CollectionDriver(db);
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { //J
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

app.post('/:collection/:database', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
    var dataBase = req.params.database;
    var db = mongoClient.db(dataBase);
    collectionDriver = new CollectionDriver(db);
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(200, docs); } //B
     });
});

app.put('/:collection/:database/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    var dataBase = req.params.database;
    var db = mongoClient.db(dataBase);
    collectionDriver = new CollectionDriver(db);
    if (entity) {
       collectionDriver.update(collection, req.body, entity, function(error, objs) { //B
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C
       });
   } else {
	   var error = { "message" : "Cannot PUT a whole collection" }
	   res.send(400, error);
   }
});

app.delete('/:collection/:database/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    var dataBase = req.params.database;
    var db = mongoClient.db(dataBase);
    collectionDriver = new CollectionDriver(db);
    if (entity) {
       collectionDriver.delete(collection, entity, function(error, objs) { //B
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C 200 b/c includes the original doc
       });
   } else {
       var error = { "message" : "Cannot DELETE a whole collection" }
       res.send(400, error);
   }
});
 
app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});