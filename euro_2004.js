//this script takes a text as input and finds the most important entities using dbpedia-spotlight (language: english, confidence:0.5,support:0) and saved them at obj object. After that, in every entity is inserting an abstract with important informations about her. Finally the final obj saved as a json file.

//use default endpoints 
  var mlspotlight = require('dbpedia-spotlight');
  var fs = require('fs');
  var request = require('request');
  var cheerio = require('cheerio');


  input= "The 2004 UEFA European Championship, commonly referred to as UEFA Euro 2004 or Euro 2004, was the 12th edition of the UEFA European Championship, a quadrennial football competition contested by the men's national teams of the member associations of UEFA. The final tournament was hosted in Portugal for the first time. It took place from 12 June to 4 July 2004, and matches were played in ten venues across eight cities: Aveiro, Braga, Coimbra,Guimaraes, Faro/Loule, Leiria, Lisbon and Porto. In the opening match against hosts Portugal, Greece achieved a surprise 2–1 victory, receiving the nickname 'pirate ship' used by Greek sportscasters in reference to the floating ship used in the tournament's opening ceremony. Greece then drew with Spain, before losing to Russia in their last group stage game. Greece advanced to the quarter-finals as runners-up, ahead Spain on goals scored. In the quarter-final the Greeks continued to stun everybody. Firm defensive play and an Angelos Charisteas goal on 65 minutes helped them defeat France 1–0 and send Greece through to the semi-finals. This victory made Greece the first team to defeat both the holders and the hosts in the same tournament.  Greece reached the semifinals to face the Czech Republic. The Czech Republic looked likely candidates to face the hosts in the final. They were favorites to take the trophy, having won all four games. However, they would have to see off the upstart Greeks to do so. The Czechs had several chances, including a shot from Tomas Rosicky that struck the bar. The game remained goalless, until the dying moments of the first half of extra-time, when Traianos Dellas headed home the winner, the first and only silver goal in a European Championship. For the first time in history, the final was a repeat of the opening game, with Greece and hosts Portugal facing off in a rematch. In the 57th minute, Charisteas gave Greece the lead with a header from a corner by Angelos Basinas. Portugal had much of the possession, but the Greek defence was solid and dealt with most attacks. Cristiano Ronaldo had a good chance to equalise in the dying moments, but could not apply a finish. Greece held on to win 1–0, winning the tournament, an achievement considered by many to be one of the greater football upsets in history, if not the greatest.";
  

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
            obj.Resources[c]['@abstract']=result;                                              // if its ok

            fs.writeFile("json_files/euro_2004.json",JSON.stringify(obj), function(err) {      // we save the json file containing the input text, the 
                if(err) {                                                                      // annotated entities and the abstracts for those entities 
                  return console.log(err);                                                     // at the folder "json_files"
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

