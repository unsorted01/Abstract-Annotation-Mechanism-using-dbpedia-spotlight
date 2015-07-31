//this script takes a text as input and finds the most important entities using dbpedia-spotlight (language: english, confidence:0.5,support:0) and saved them at obj object. After that, in every entity is inserting an abstract with important informations about her. Finally the final obj saved as a json file.

//use default endpoints 
  var mlspotlight = require('dbpedia-spotlight');
  var fs = require('fs');
  var request = require('request');
  var cheerio = require('cheerio');

  input= "The 2005 FIBA European Championship, commonly called FIBA EuroBasket 2005, was the 34th FIBA EuroBasket regional basketball championship held by FIBA Europe, which also served as Europe qualifier for the 2006 FIBA World Championship, giving a berth to the top six teams in the final standings. It was held in Serbia and Montenegro between 16 September and 25 September 2005. Sixteen national teams entered the event under the auspices of FIBA Europe, the sport's regional governing body. The cities of Belgrade, Novi Sad, Podgorica and Vrsac hosted the tournament. It was the third time that the championship was hosted by the city of Belgrade (previous times were in 1961 and 1975).Greece were considered a strong outsider for the medals at the EuroBasket 2005. They advanced from the group stage with two wins in three games and eliminated Israel and Russia to reach the semi-finals, where they faced France. The French were leading the score by seven points with only one minute left, Greece appeared to have no chance to pull out the win and one more lost semi-final was coming. However, the Greeks managed to get within a two-point distance and won 67–66 with a three-pointer by Dimitris Diamantidis with three seconds remaining, setting off a joyous celebration from the Greek side. At the final Greece concluded their improbable EuroBasket run with a convincing 78-62 victory over Germany to win the gold medal for the first time since 1987. In front of a raucous pro-Greece, sold out crowd of 19,000 at the Belgrade Arena, the Greeks used their trademark of teamwork and solid defence to roll to victory over a Dirk Nowitzki led German team. As the final buzzer sounded, players ran on to the court in celebration and the thousands of Greek fans in attendance rose to their feet singing songs from their homeland. Head coach Panagiotis Yannakis was thrown in the air by his players.";
  
  function abs(myuri,c,obj,callback){                                   // in this function we take as input the URL for every recognised entity in dbpedia
    request(encodeURI(myuri), function (error, response, html) {        // and we load the dbpedia page in order to extract an abstract

      if (response.statusCode == 404) {
        console.log(c);                                                     // print in which entities can't insert an abstract
      }

                var $ = cheerio.load(html);                                 // loading the dbpedia page for every entity
                var b ;
                $('p').first().contents().filter(function(i, element){      // our abstract is located at the first paragraph of the dbpedia page
                     b = $(this).text();                                    // we save the abstract in the local variable "b"
                });
                return callback (b,response.statusCode,myuri,c,obj);        // finally we send the abstract and the response status for every entity  
    })
  };                                                                        // as callback to function "save" in order to save the final json file



function save(result,res,uri,c,obj){
  
        if (res==503) {                                     //if the server is currently unable to handle the request  we try again until its done      
          abs(uri,c,obj,save);  
        }
        else{
            obj.Resources[c]['@abstract']=result;                                                // if its ok

            fs.writeFile("json_files/eurobasket_2005.json",JSON.stringify(obj), function(err) {  // we save the json file containing the input text, the 
                if(err) {                                                                        // annotated entities and the abstracts for those  
                  return console.log(err);                                                       // entities at the folder "json_files"
                };
            });
        };
};



mlspotlight.annotate(input,function(output){                  // using dbpedia-spotlight the input text is being annotated
    
      var obj= JSON.parse(JSON.stringify(output.response));   // and saved at obj

      for (var c = 0; c <obj.Resources.length; c++) {         // for every annotated entity an abstract is being inserted
   
           var uri=obj.Resources[c]['@URI'];                  // using his dbpedia url
           abs(uri,c,obj,save);                               // and finally saved

        };

      console.log(obj.Resources.length);                     // print how many entities annotated
    
});

