var express = require('express');
var app = express();
var DButilsAzure = require('./DButils');
const fs = require('fs');

//</editor-fold>

//thank you stackoverflow
function makepassword(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function makeusername(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

app.use(express.json());


var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

//1 // done////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/login/:username/:password', function(req, res){
    var username=req.params['username'];
    var password=req.params['password'];

    DButilsAzure.execQuery("SELECT username FROM Users WHERE password = '" + password+ "'")

        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            if(result.length==0)
                res.send("error "+username);
            else
                res.send("hello "+username)
        })

        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//3 done //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Register a new user, send his personal data to Users, his fields of interest to Fields_of_interest, and his authentication questions to Authentication_questions
app.post('/register/:first_name/:last_name/:city/:country/:field_of_interest1/:field_of_interest2/:question1/:answer1/:question2/:answer2', (req, res) => {
    var username = makeusername(8);//randomization logic here (only letters, 3-8 chars)
    var password = makepassword(10);//randomization logic here (alphanumeric, 5-10 chars)
    var first_name = req.params.first_name;
    var last_name = req.params.last_name;
    var city = req.params.city;
    var country = req.params.country;
    var fieldOfInterest1 = req.params.field_of_interest1;
    var fieldOfInterest2 = req.params.field_of_interest2;
    var question1 = req.params.question1;
    var answer1 = req.params.answer1;
    var question2 = req.params.question2;
    var answer2 = req.params.answer2;

    getUser(username,password,first_name,last_name,city,country)
        .then(interests => getInterests(username,fieldOfInterest1))
        .then(interests2 => getInterests2(username,fieldOfInterest2))
        .then(QandA => getQandA(username,question1,answer1))
        .then(QandA => getQandA2(username,question2,answer2))
        .then(function(){
            res.header("Access-Control-Allow-Origin","*");
            res.send("username = "+username+", password = "+ password)
        })
        .catch(error => console.log(error.message));
});

//7 done //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/RestorePassword/:username/:question/:answer', (req, res) => {
    var username=req.params['username'];
    var question=req.params['question'];
    var answer=req.params['answer'];
    var newPassword = makepassword(10);//randomization logic here (alphanumeric, 5-10 chars)

    DButilsAzure.execQuery("SELECT answer FROM Authentication_questions WHERE username = '" + username+ "'"+"AND question = "+"'"+question+"'"+"AND answer = "+"'"+answer+"'")

        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            if(result.length==0)
                res.send("error "+username);
            else{
                res.send("newPassword " + newPassword);
                DButilsAzure.execQuery("UPDATE Users SET password ="+"'"+newPassword +"'"+ " WHERE username = '" + username+ "'");
            }
        })

        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//done //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//8
//Insert new tuple to Authentication_questions
app.get('/insertQuestion/:username/:question/:answer', (req, res) => {
    var username = req.params.username;
    var question = req.params.question;
    var answer = req.params.answer;

    DButilsAzure.execQuery(
        "IF NOT EXISTS(select * from Authentication_questions where username="+"'"+username+"'"+" and question="+"'"+question+"'"+ ")"+
        "INSERT INTO Authentication_questions (username, question, answer)" + "VALUES ('"+username+"','"+question+"','"+answer+"')" +
        "ELSE " +
        "UPDATE Authentication_questions SET answer="+"'"+answer+"'"+"WHERE username="+"'"+username+"'"+" AND question="+"'"+question+"'"+";"
    )
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send('current question : '+question+'' +
                ', the answer: '+ answer);
        })
        .catch(function (err) {
            res.send(err)
        });
});

// //Insert new tuple to Cities
// app.get('/add_new_city/:city', (req, res) => {
//     var city = req.params.city;
//     var wikipedia_url = 'https://en.wikipedia.org/wiki/' + city.replace(' ','_');
//     DButilsAzure.execQuery("INSERT INTO Cities (city, about)" +
//         "VALUES ('"+city+"','"+wikipedia_url+"')")
//         .then(function (result) {
//             res.header("Access-Control-Allow-Origin","*");
//             res.send(result);
//         })
//         .catch(function (err) {
//             res.send(err)
//         });
// });

//2\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\done\\\\\\\\\\\\
//Get all cities
app.get('/getCities', (req, res) => {
    DButilsAzure.execQuery("SELECT city FROM Cities")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });
});

//10\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\done\\\\\\\\\\\\
//Get about information
app.get('/getAboutInfo/:city', (req, res) => {
    var city = req.params.city;
    DButilsAzure.execQuery("SELECT about FROM Cities WHERE city='"+city+"'")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });
});

//2\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\done\\\\\\\\\\\\
//Insert new tuple to POI
app.get('/add_new_POI/:name/:category', (req, res) => {
    var name = req.params.name;
    var city = req.params.city;
    var category = req.params.category;
    DButilsAzure.execQuery("INSERT INTO POI (name, city, category)" +
        "VALUES ('"+name+"','"+category+"')")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });
});
//not working
//9
app.get('/getRandomPOI/:amount', function(req, res){
    DButilsAzure.execQuery
    ("SELECT TOP "+ req.params['amount'] + " * FROM POI ")
        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        })
});
//10\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\done\\\\\\\\\\\\

//15
app.get('/get_attractions_by_city/:city', function(req, res){
    DButilsAzure.execQuery
    ("SELECT name FROM POI WHERE city Like '%" + req.params['city'] + "%'")
        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
});
//10\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\done\\\\\\\\\\\\
//19
app.get('/get_attractions_by_category/:category', function(req, res){
    DButilsAzure.execQuery
    ("SELECT * FROM POI WHERE category Like '%" + req.params['category'] + "%'")
        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        })
});
//19
app.get('/get_attractions_by_category_sort', function(req, res){
    DButilsAzure.execQuery
    ("SELECT POI_ID,name,category,image FROM POI ORDER BY category")
        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);

        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        })
});//19
app.get('/get_attractions_by_rate_sort', function(req, res){
    DButilsAzure.execQuery
    ("SELECT POI_ID,name,category,image FROM POI ORDER BY avg_rating")
        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);

        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
});//19
app.get('/last_saved/:ID', function(req, res){
    DButilsAzure.execQuery
    ("SELECT TOP 2 * FROM Saved_attractions WHERE POI_ID Like '%" + req.params['ID'] + "%' ORDER BY date DESC")
        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);

        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});
//10\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\done\\\\\\\\\\\\

//20
app.get('/get_attractions_by_name/:name', function(req, res){
    DButilsAzure.execQuery
    ("SELECT * FROM POI WHERE name Like '%" + req.params['name'] + "%'")
        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
});

//24
//24 not working
//24
//24 stopped here
app.get('/move_to_POI/:POI_ID', function(req, res){
    DButilsAzure.execQuery
    ("SELECT * FROM POI WHERE POI_ID Like '%" + req.params['POI_ID'] + "%'")
        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
});

//11
//Insert new tuple to saved attractions
app.get('/save_attraction/:username/:POI_ID', (req, res) => {
    var username = req.params['username'];
    var POI_ID = req.params['POI_ID'];
    var date = formatDate(new Date());
    console.log(date);
    DButilsAzure.execQuery("INSERT INTO Saved_attractions (username, POI_ID, date)" +
        "VALUES ('"+username+"','"+POI_ID+"','"+date+"')")
        .then(function (result) {
            res.send(result);
        })
        .catch(function (err) {
            res.send(err);
        });
});

//11/////////////////////////////////done

//17
app.get('/get_saved_attractions/:username', function(req, res){
    DButilsAzure.execQuery
    ("SELECT POI_ID FROM Saved_attractions Where username= "+ req.params['username']+" ;")
        .then(function(result){
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
});


//23
//Update sort to a customized sort chosen by the user
app.get('/change_saved_attractions_sort/:username/:POI_ID', (req, res) => {
    //pseudo-code:
    // get and parse a data structure (preferably a json file) that contains all of the saved attractions with their new order
    //for(keyvalue pair in json file)//for every key value pair
    //    DButilsAzure.execQuery("UPDATE Saved_attractions SET sorted_order=value WHERE username='"+keyusername+"' AND POI_ID='"+keyPOI_ID+"')")
    //         .then(function (result) {
    //             res.send(result);
    //         })
    //         .catch(function (err) {
    //             res.send(err)
    //         });
    //}
});

//22 done
//Delete review from a user's favourite attraction by username and POI_ID (both comprise a composite key and both are foreign keys to other tables)
app.delete('/remove_saved_attraction/:username/:POI_ID', (req, res) => {
    var username = req.params.username;
    var POI_ID = req.params.POI_ID;
    DButilsAzure.execQuery("DELETE FROM Saved_attractions WHERE username='"+username+"' AND POI_ID='"+POI_ID+"'")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });
});

//18
//Insert new tuple to Reviews
app.get('/save_review/:username/:POI_ID/:review/:rating', (req, res) => {
    var username = req.params.username;
    var POI_ID = req.params.POI_ID;
    var review = req.params.review;
    var rating = req.params.rating;
    var new_rating = 0;
    var date = new Date();

    DButilsAzure.execQuery("INSERT INTO Reviews (username, POI_ID, review, rating, date)" +
        "VALUES ('"+username+"','"+POI_ID+"','"+review+"','"+rating+"','"+date+"')")
        .then(function (result) {
            DButilsAzure.execQuery(
                "SELECT AVG(rating)" +
                "FROM Reviews" +
                "WHERE POI_ID='" +
                POI_ID +
                "';")
                .then(function (result) {
                    new_rating = result;
                    DButilsAzure.execQuery(
                        "UPDATE POI" +
                        "SET avg_rating='" +
                        new_rating +
                        "'" +
                        "WHERE POI_ID='" +
                        POI_ID +
                        "';"
                    );
                });
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });




});

//21
//Delete review from reviews by username and POI_ID (both comprise a composite key and both are foreign keys to other tables)
app.get('/delete_review/:username/:POI_ID', (req, res) => {
    var username = req.params.username;
    var POI_ID = req.params.POI_ID;
    DButilsAzure.execQuery("DELETE FROM Reviews WHERE username='"+username+"' AND POI_ID='"+POI_ID+"'")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });
});

app.get('/getPOIinfo/:POI_ID', (req, res) => {
    var username = req.params.username;
    var POI_ID = req.params.POI_ID;
    DButilsAzure.execQuery("select * FROM POI WHERE POI_ID='"+POI_ID+"'")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });
});
app.get('/getPOIinfo/:POI_ID', (req, res) => {
    var username = req.params.username;
    var POI_ID = req.params.POI_ID;
    DButilsAzure.execQuery("select * FROM POI WHERE POI_ID='"+POI_ID+"'")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });
});




















app.get('/getReviewByPOI/:POI_ID', (req, res) => {
    var POI_ID = req.params.POI_ID;
    DButilsAzure.execQuery("select review,rating,date FROM Reviews WHERE POI_ID='"+POI_ID+"'")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });
});
app.get('/2POIforUser/:username', (req, res) => {
    var username = req.params.username;
    DButilsAzure.execQuery("select * from POI where POI_ID IN (select TOP 2 POI_ID FROM Saved_attractions WHERE username ='"+username+"')")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });
});

app.get('/getPOIforUser/:username', (req, res) => {
    var username = req.params.username;
    DButilsAzure.execQuery("select * from POI where POI_ID IN (select TOP 2 POI_ID FROM Saved_attractions WHERE username ='"+username+"')")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err)
        });
});