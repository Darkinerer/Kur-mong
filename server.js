const express = require('express')
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
const session = require('express-session')
var helpers = require('handlebars-helpers')(['object']);
const bodyParser = require("body-parser");
const app = express()

app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));



app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));



  const url = "mongodb://localhost:27017/";
const mongoClient = new MongoClient(url, { useNewUrlParser: true });
let user
let admin = {name: "admin", age: 1000, password:"passadmin", email:"admin@admin.com",desription:"amin",interes:"admin"};
mongoClient.connect(function(err, client){
      
    const db = client.db("usersdb");
    const collection = db.collection("users");
    const collection2 = db.collection("events")
  

      app.get("/adminev",function(req,res){
        collection2.find().toArray(function(err,data){
            
            res.render("adminev.hbs", {
                events: data

            });
        })
    })
    app.get("/adminev",function(req,res){
        collection2.find().toArray(function(err,data){
            
            res.render("adminev.hbs", {
                events: data

            });
        })
    })
    app.get("/", function(req, res){
        console.log(req.session.email)
       if(!req.session.email)
       if(req.session.email==admin.email)
       {res.render("adminus.hbs")}
       else
           {res.render("index.hbs");}
           else{res.render("autind.hbs")}
         });

     app.get("/crevent", function(req, res){
           collection.find({email:req.session.email}).toArray( function(err, data) {
            
                  res.render("crevent.hbs", {
                      user: data

                  });
                })
              
            });

   app.post("/crevent",  function (req, res) {
       let user 

        collection.find( {email:req.session.email}).toArray( function(err, data) {
           user=data[0]._id
           console.log(user)
        
         console.log(user)
         const name = req.body.name;
         
         const lat = req.body.lat;
         const lng = req.body.lng;
         const tag = req.body.tag;
         const description = req.body.description
        
                collection2.insertOne({name:name, user:user,lat:lat,lng:lng,tag:tag,description:description}, function(err, data) {
                     if(err) return console.log(err);
                     console.log(req.session.email)
                     res.redirect("/profile")
                  
                 })    
               
                        })
                });



app.get("/events", function(req, res){
 collection2.find().toArray(function (err,results) {
    res.render("events.hbs",{events:results});

 })
        
    
});
app.get("/evfilters", function(req, res){
    collection2.find().toArray(function (err,results) {
       res.render("evfilters.hbs",{events:results});
   
    })
           
       
   });
   app.get("/usfilters", function(req, res){
    collection.find().toArray(function (err,results) {
       res.render("usfilters.hbs",{users:results});
   
    })
           
       
   });

app.get("/", function(req, res){
    console.log(req.session.email)
   if(!req.session.email)
       {res.render("index.hbs");}
       else{res.render("autind.hbs")}
     });
app.get("/logout", function(req, res){
        req.session.email=undefined
           res.redirect("/");
         });
    // получение списка пользователей
app.get("/users", function(req, res){
    collection.find().toArray( function(err, data) {
        if(err) return console.log(err);
        res.render("users.hbs", {
            users: data
        });
      });
    
  });

  app.get("/profile", function(req, res){
    
    collection.find({ email:req.session.email}).toArray( function(error, results, fields) {
user=results      
    
console.log(user)
res.render("profile.hbs",{
    user:user
    });
    })
    
  });

      app.post("/ftag",function (req,res) {
      console.log(req.body.tag)
      collection2.find({tag:req.body.tag}).toArray(function (err,results) {
          res.render("evfilters.hbs",{
              events:results
          })
      })

  })
  app.post("/fuev",function (req,res) {
    console.log(req.body.id)
    collection2.find({user:new ObjectId(req.body.id)}).toArray(function (err,results) {
        res.render("fevent.hbs",{
            events:results
        })
    })

})
app.get("/fevent",function(req,res)
{
    collection2.find().toArray(function(err,results){
        res.render("fevent.hbs",{
            events:results
        })
    })
})
app.post("/fevcode",function (req,res) {
    console.log(req.body.eid)
    collection2.find({_id:new ObjectId(req.body.eid)}).toArray(function (err,results) {
        res.render("fevent.hbs",{
            events:results
        })
    })

})
  app.post("/fage",function (req,res) {
  let users=[]

    collection.find().toArray(function (err,results) {
        results.forEach(element => {
            if(element.age>=req.body.sage && element.age<=req.body.eage)
            {users.push(element)}
        });
        console.log(users)
        res.render("usfilters.hbs",{
            users:users
        })
    })

})
  app.post("/finteres",function (req,res) {
    console.log(req.body.interes)
    collection.find({interes:req.body.interes}).toArray(function (err,results) {
        res.render("usfilters.hbs",{
            users:results
        })
    })

})



  app.post("/profile",  function (req, res) {
    const name = req.body.name;
    const age = req.body.age;
    const email = req.body.email;
    const password = req.body.password
    const interes = req.body.interes
    const description = req.body.description
    collection.findOneAndUpdate(
        {email: req.session.email}, // критерий выборки
        { $set: {name:name,age:age,email:email,password:password,interes:interes,desription:description}}, // параметр обновления
        function(err, result){
             
            console.log(result);
            req.session.email=email;
            res.redirect("/")
        }
    );
  });
app.get("/create",function(req,res){
    res.render("create.hbs")
})

app.post("/create",  function (req, res) {
    const o = req.body.email
    console.log(o);
    
    collection.find({email:o}).toArray(function(err, results){
     if(err){
         console.log(err);
     }   
     else{
         if(results.length > 0){  
               res.redirect('/create')
              
         }else{
          const name = req.body.name;
          const age = req.body.age;
          const email = req.body.email;
          const password = req.body.password;
          const interes = req.body.interes;
          const description = req.body.description
          let user = {name: name, age: age, password:password, email:email,desription:description,interes:interes};
          collection.insertOne(user, function(err, result){
          
            if(err){ 
                return console.log(err);
            }
            console.log(result.ops);
            res.redirect("/")
         
        });
         }
     }
  })
  });
  app.get('/login', function(request, response) {
	response.render('login.hbs');
});
app.get("/adminus",function (req,res) {
    collection.find().toArray(function (err,results) {
        res.render("adminus.hbs",{
            users:results
        })
        
    })
    
})
// аутентифікація
app.post('/auth', function(request, response) {
	var email = request.body.email;
    var password = request.body.password;
    
	if (email && password) {
if(email==admin.email && password == admin.password)
{
response.redirect("/adminus")
}else{collection.find({email:email,password:password}).toArray(function(err, results){
    if (results.length > 0) {
        request.session.loggedin = true;
        request.session.email = email;
response.redirect('/profile');
console.log(request.session.email)
    } else {
        response.send('Incorrect email and/or Password!');
    }			
    response.end();
});
}}
         else {
		response.send('Please enter email and Password!');
		response.end();
	}

		
			
});
app.post("/deleteuser/:id", function(req, res){
          
   collection2.deleteMany({user: new ObjectId(req.params.id)},function (err,results) {
       if(err) console.log(err);
       
   })
    collection.deleteOne({_id: new ObjectId(req.params.id)}, function(err, data) {
       if(err) return console.log(err);
       res.redirect("/adminus");
     });
   });

app.get("/fusers",function(req,res)
{
    collection.find().toArray(function(err,data){
        res.render("fusers.hbs",{
            users:data
        })
    })
})

app.post("/fuscode",function(req,res){
    collection.find({_id : new ObjectId(req.body.id)}).toArray(function(err,data){
        res.render("fusers.hbs",{
            users:data
        })
    })
})

app.post("/delete/:id", function(req, res){
          
   
   collection2.deleteOne({_id: new ObjectId(req.params.id)}, function(err, data) {
      if(err) return console.log(err);
      res.redirect("/profile");
    });
  });


  app.post("/deleteev/:id", function(req, res){
          
   
    collection2.deleteOne({_id: new ObjectId(req.params.id)}, function(err, data) {
       if(err) return console.log(err);
       res.redirect("/adminev");
     });
   });

app.get("/profile", function(req, res){
     
    collection.find({email:req.session.email}).toArray( function(error, results, fields) {
     user=results;
     console.log(user.description)
      res.render("profile.hbs",{
        user:user
        });
     
    })
   
  });
  app.get("/myevents", function(req, res){
     console.log(req.session.email)
    collection.find({email:req.session.email}).toArray( function(error, results, fields) {
       user=JSON.stringify(results[0]._id)
          
       })
       console.log(user)
       collection2.find({user:user[0]._id}).toArray( function(error, results, fields) {
        console.log(results)
                   res.render("myevents.hbs",{
                     events:results
                     });
                  
                 })
   
  });





});
app.listen(3000, function() {
    console.log('Подключение');
});