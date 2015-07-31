//this script takes a text as input and finds the most important entities using dbpedia-spotlight (language: english, confidence:0.5,support:0) and saved them at obj object. After that, in every entity is inserting an abstract with important informations about her. Finally the final obj saved as a json file.

//use default endpoints 
  var mlspotlight = require('dbpedia-spotlight');
  var fs = require('fs');
  var request = require('request');
  var cheerio = require('cheerio');

  input= "The 1987 FIBA European Championship, commonly called FIBA EuroBasket 1987, was the 25th FIBA EuroBasket regional basketball championship, held by FIBA Europe. It was held in Greece between 3 and 14 June 1987. Twelve national teams entered the event under the auspices of FIBA Europe, the sport's regional governing body. ThePeace and Friendship Stadium in Piraeus was the hosting venue of the tournament. Greece faced up their biggest challenge, as the country was the host of the EuroBasket 1987 and the team enjoyed a formidable line-up. Qualified from the preliminary round, they eliminated Italy and Yugoslavia, both among the favourites to win the tournament, in the quarter-finals and the semi-finals respectively. In the final, Greece faced the defending champions and heavily favoured Soviet Union. In front of 17,000 Greek fans at the Peace and Friendship Stadium, the hosts won the gold medal after a thrilling win 103–101 over the Soviets, with Nikos Galis scoring 40 points. It was the first time that a Greek national team won a major tournament in any sports, thus basketball was made the national team sport overnight and the national team was to be considered the official cherished of the Greek nation. Since then Greece has been placed in the high level on the basketball stage.";
  
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

            fs.writeFile("json_files/eurobasket_1987.json",JSON.stringify(obj), function(err) {  // we save the json file containing the input text, the 
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

