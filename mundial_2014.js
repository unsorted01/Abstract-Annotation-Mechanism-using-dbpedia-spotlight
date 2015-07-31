//this script takes a text as input and finds the most important entities using dbpedia-spotlight (language: english, confidence:0.5,support:0) and saved them at obj object. After that, in every entity is inserting an abstract with important informations about her. Finally the final obj saved as a json file.

//use default endpoints 
  var mlspotlight = require('dbpedia-spotlight');
  var fs = require('fs');
  var request = require('request');
  var cheerio = require('cheerio');


  input= " The 2014 FIFA World Cup was the 20th FIFA World Cup, the tournament for the association football world championship, which took place at several venues across Brazil. The tournament began on 12 June with a group stage and concluded on 13 July with the championship match. Ahead of Greece's third FIFA World Cup there was one aim: to reach the knockout stages for the first time. Mission accomplished then, with their customary flair for the dramatic, since Fernando Santos' side were heading out until the final minute of their last group match against Ivory Coast. Greece was drawn into Group C with Colombia, Cote d'Ivoire and Japan and ultimately created for itself an extraordinarily similar tournament experience as it did two years prior at Euro 2012. In the first game against Colombia, the Colombians proved to be the more clinical finishers, prevailing over the Europeans 3–0 despite an even amount of shots for both teams and a slight possession advantage in Greece's favor.To stave off the threat of elimination the Greeks needed to win at least a point in their second match with Japan who sat alongside them at the foot of Group C. The task grew more difficult once two errant slide tackles by captain Kostas Katsouranis each drew yellow cards and reduced Greece to ten men. Japan controlled much of possession in a 0–0 draw and remained tied with Greece on points due to poor finishing from close range. The draw made it necessary for Greece to defeat Ivory Coast in its final group match in order to reach the round of 16 for the first time in its history. Unlike its mirror-scenario final group match against Russia in Euro 2012, the Greeks came out as the aggressors from the outset against Ivory Coast. Andreas Samaris scored his first international goal after intercepting a faulty back-pass by an Ivorian defender. Also unlike its 2012 match with Russia, capitalizing on a first half opponent miscue would not be enough to carry Greece to a needed victory. Swansea City striker Wilfried Bony equalized for Ivory Coast in the 73rd minute. The Ivorians promptly adopted Greece's defensive strategy but could not hold out until the game's end. In the first minute of stoppage time, Ivory Coast striker Giovanni Sio obstructed a Georgos Samaras shot by clipping him from behind in the Ivorian penalty area, resulting in a Greek penalty kick which Samaras converted with thirty seconds remaining in the game, to wild celebrations in Greece. As Group C runners-up Greece was paired in a playoff with Group D shock winner Costa Rica, who won its first ever World Cup group stage over former world champions Uruguay, Italy and England. Greece forced extra time against Costa Rica with a 91st-minute Sokratis Papastathopoulos leveller. But, They were denied a quarter-final berth after the first penalty-shoot out in Greece's 550-match history. Costa Rica claimed its first World Cup knockout stage victory and denied Greece its first by defeating the Greeks 5–3 on penalties.";
  
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

            fs.writeFile("json_files/mundial_2014.json",JSON.stringify(obj), function(err) {     // we save the json file containing the input text, the 
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
