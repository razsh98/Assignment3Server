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



function getQandA(username,question1,answer1) {
    console.log("getQandA");
    return new Promise((resolve, reject) => {
        resolve(DButilsAzure.execQuery("INSERT INTO Authentication_questions (username, question, answer)" +
            "VALUES ('"+username+"','"+question1+"','"+answer1+"')"));
    });
}
function getQandA2(username,question1,answer1) {
    console.log("getQandA2");
    return new Promise((resolve, reject) => {
        resolve(DButilsAzure.execQuery("INSERT INTO Authentication_questions (username, question, answer)" +
            "VALUES ('"+username+"','"+question1+"','"+answer1+"')"));
    });
}


function getUser(username,password,first_name,last_name,city,country) {
    console.log("getUser");
    return new Promise((resolve, reject) => {
        resolve(DButilsAzure.execQuery("INSERT INTO Users (username, password, first_name, last_name, city, country)" +
            "VALUES ('"+username+"','"+password+"','"+first_name+"','"+last_name+"','"+city+"','"+country+"')"));

    });
}

function getInterests(username,fieldOfInterest1) {
    console.log("getInterests");
    return new Promise((resolve, reject) => {

        resolve(DButilsAzure.execQuery("INSERT INTO Fields_of_interest (username, field_of_interest)" +
            "VALUES ('"+username+"','"+fieldOfInterest1+"')"));

    });
}

function getInterests2(username,fieldOfInterest2) {
    console.log("getInterests2");
    return new Promise((resolve, reject) => {

        resolve(DButilsAzure.execQuery("INSERT INTO Fields_of_interest (username, field_of_interest)" +
            "VALUES ('"+username+"','"+fieldOfInterest2+"')"));

    });
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
            res.send(err);
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

//2\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\done\\\\\\\\\\\\add to doco
//Get all cities
app.get('/getCities', (req, res) => {
    DButilsAzure.execQuery("SELECT * FROM Users")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send('Yerushaláyim');
        })
        .catch(function (err) {
            res.send(err)
        });
});

//10\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\done\\\\\\\\\\\\
//Get about information
app.get('/getAboutInfo/:city', (req, res) => {
    var city = req.params.city;
    DButilsAzure.execQuery("SELECT * FROM Users")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send("Jerusalem (/dʒəˈruːsələm/; Hebrew: יְרוּשָׁלַיִם About this soundYerushaláyim; Arabic: القُدس‎ About this soundal-Quds)[note 2] is a city in the Middle East, located on a plateau in the Judaean Mountains between the Mediterranean and the Dead Sea. It is one of the oldest cities in the world, and is considered holy to the three major Abrahamic religions—Judaism, Christianity, and Islam. Both Israel and the Palestinian Authority claim Jerusalem as their capital, as Israel maintains its primary governmental institutions there and the State of Palestine ultimately foresees it as its seat of power; however, neither claim is widely recognized internationally.[note 3][9]\n" +
                "\n" +
                "During its long history, Jerusalem has been destroyed at least twice, besieged 23 times, captured and recaptured 44 times, and attacked 52 times.[10] The part of Jerusalem called the City of David shows first signs of settlement in the 4th millennium BCE, in the shape of encampments of nomadic shepherds.[11][12] Jerusalem was named as \"Urusalim\" on ancient Egyptian tablets, probably meaning \"City of Shalem\" after a Canaanite deity, during the Canaanite period (14th century BCE). During the Israelite period, significant construction activity in Jerusalem began in the 9th century BCE (Iron Age II), and in the 8th century the city developed into the religious and administrative center of the Kingdom of Judah.[13] In 1538, the city walls were rebuilt for a last time around Jerusalem under Suleiman the Magnificent. Today those walls define the Old City, which has been traditionally divided into four quarters—known since the early 19th century as the Armenian, Christian, Jewish, and Muslim Quarters.[14] The Old City became a World Heritage Site in 1981, and is on the List of World Heritage in Danger.[15]\n" +
                "\n" +
                "Since 1860 Jerusalem has grown far beyond the Old City's boundaries. In 2015, Jerusalem had a population of some 850,000 residents, comprising approximately 200,000 secular Jewish Israelis, 350,000 Haredi Jews and 300,000 Palestinians.[16][note 4] In 2016, the population was 882,700, of which Jews comprised 536,600 (60.8%), Muslims 319,800 (36.2%), Christians 15,800 (1.8%), and 10,300 unclassified (1.2%).[18]\n" +
                "\n" +
                "According to the Bible, King David conquered the city from the Jebusites and established it as the capital of the united kingdom of Israel, and his son, King Solomon, commissioned the building of the First Temple.[note 5] Modern scholars argue that Jews branched out of the Canaanite peoples and culture through the development of a distinct monolatrous — and later monotheistic — religion centered on El/Yahweh,[20][21][22] one of the Ancient Canaanite deities. These foundational events, straddling the dawn of the 1st millennium BCE, assumed central symbolic importance for the Jewish people.[23][24] The sobriquet of holy city (עיר הקודש, transliterated 'ir haqodesh) was probably attached to Jerusalem in post-exilic times.[25][26][27] The holiness of Jerusalem in Christianity, conserved in the Septuagint[28] which Christians adopted as their own authority,[29] was reinforced by the New Testament account of Jesus's crucifixion there. In Sunni Islam, Jerusalem is the third-holiest city, after Mecca and Medina.[30][31] In Islamic tradition, in 610 CE it became the first qibla, the focal point for Muslim prayer (salat),[32] and Muhammad made his Night Journey there ten years later, ascending to heaven where he speaks to God, according to the Quran.[33][34] As a result, despite having an area of only 0.9 square kilometres (0.35 sq mi),[35] the Old City is home to many sites of seminal religious importance, among them the Temple Mount with its Western Wall, Dome of the Rock and al-Aqsa Mosque, and the Church of the Holy Sepulchre. Outside the Old City stands the Garden Tomb.\n" +
                "\n" +
                "Today, the status of Jerusalem remains one of the core issues in the Israeli–Palestinian conflict. During the 1948 Arab–Israeli War, West Jerusalem was among the areas captured and later annexed by Israel while East Jerusalem, including the Old City, was captured and later annexed by Jordan. Israel captured East Jerusalem from Jordan during the 1967 Six-Day War and subsequently annexed it into Jerusalem, together with additional surrounding territory.[note 6] One of Israel's Basic Laws, the 1980 Jerusalem Law, refers to Jerusalem as the country's undivided capital. All branches of the Israeli government are located in Jerusalem, including the Knesset (Israel's parliament), the residences of the Prime Minister (Beit Aghion) and President (Beit HaNassi), and the Supreme Court. While the international community rejected the annexation as illegal and treats East Jerusalem as Palestinian territory occupied by Israel,[39][40][41][42] Israel has a stronger claim to sovereignty over West Jerusalem.[43][44]"
        );
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
    ("SELECT POI_ID FROM Saved_attractions Where username= '"+ req.params['username']+"' ;")
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
    var date = formatDate(new Date());

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
app.delete('/delete_review/:username/:POI_ID', (req, res) => {
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
    DButilsAzure.execQuery("select description FROM POI WHERE POI_ID='"+POI_ID+"'")
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
    DButilsAzure.execQuery("select * from POI where POI_ID IN (select POI_ID FROM Saved_attractions WHERE username ='"+username+"')")
        .then(function (result) {
            res.header("Access-Control-Allow-Origin","*");
            res.send(result);
        })
        .catch(function (err) {
            res.send(err);
        });
});