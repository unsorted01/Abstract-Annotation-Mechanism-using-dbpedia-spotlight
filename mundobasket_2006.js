//this script takes a text as input and finds the most important entities using dbpedia-spotlight (language: english, confidence:0.5,support:0) and saved them at obj object. After that, in every entity is inserting an abstract with important informations about her. Finally the final obj saved as a json file.

//use default endpoints 
  var mlspotlight = require('dbpedia-spotlight');
  var fs = require('fs');
  var request = require('request');
  var cheerio = require('cheerio');

  input= "The 2006 FIBA World Championship was an international basketball competition hosted by Japan from August 19 to September 3, 2006. It was co-organised by the International Basketball Federation (FIBA), Japan Basketball Association (JABBA) and the 2006 Organizing Committee. Badtz-Maru, a fellow character of Hello Kitty from Japanese company Sanrio, was the official 2006 mascot.For the first time since 1986, the World Championship was contested by 24 nations, eight more than in 2002. As a result, group rounds were conducted in four different cities, with the knockout rounds being hosted by Saitama City. In the 2006 FIBA World Championship, Greece were glazed to win a medal that had closely missed in their last two participations in the tournament and reached once more the semi-finals with a record of seven consecutive wins, some of them impressive. On the semi-final with a very tough defence and an attack of 101 points, the European Champions, Greece, beat the national team of the United States of America with a score 101-95. The Greek team had a very good day - especially Vassilis Spanoulis and Dimitris Diamantidis - while the zone defence organized by the Greek coach Panayiotis Giannakis blocked the NBA stars who, despite their good performance, will not take part in the final. The best player of the USA team was Denver Nuggets star, Carmello Anthony, who scored 25 points.The final buzzer sparked scenes of pandemonium as the Greeks danced in the centre circle as if they had won the gold medal. In the final they proved to be exhausted from their dramatic game with the Americans and lost 70–47 to Spain, ending up with the silver medal. Despite the loss the players were greeted enthusiastically by celebrating fans on their return to Greece, due to their first medal in a World Championship and their glorious win over the United States.";
  
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

            fs.writeFile("json_files/mundobasket_2006.json",JSON.stringify(obj), function(err) { // we save the json file containing the input text, the 
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