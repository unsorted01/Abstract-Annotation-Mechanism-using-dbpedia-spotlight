//this script takes a text as input and finds the most important entities using dbpedia-spotlight (language: english, confidence:0.5,support:0) and saved them at obj object. After that, in every entity is inserting an abstract with important informations about her. Finally the final obj saved as a json file.

//use default endpoints 
  var mlspotlight = require('dbpedia-spotlight');
  var fs = require('fs');
  var request = require('request');
  var cheerio = require('cheerio');

  input= "Greece competed at the 2004 Summer Olympics in Athens, from 13 to 29 August 2004, as the host nation. As the progenitor nation and in keeping with tradition, Greek athletes have competed at every Summer Olympics in the modern era, alongside Australia, Great Britain, and Switzerland. The Hellenic Olympic Committee sent a total of 426 athletes to the Games, 215 men and 211 women, and had achieved automatic qualification places in all sports, with the exception of men's and women's field hockey. It was also the nation's largest team ever in Summer Olympic history since the first modern Games were held in 1896. Greece left the Summer Olympic Games with a total of sixteen medals (six gold, six silver, and four bronze), finishing within the top fifteen position in the overall medal rankings.At least a single medal was awarded to the Greek team in ten sports; five of them came from the track and field, including two prestigious golds. Greece also topped the medal tally in diving, gymnastics, judo, and sailing. Three Greek athletes added Olympic medals to their career hardware from the previous editions. Among the nation's medalists were track hurdler Fani Halkia, race walker Athanasia Tsoumeleka, teenage judoka Ilias Iliadis, and diving duo Thomas Bimis and Nikolaos Siranidis, who won Greece's first ever Olympic gold medals in their respective disciplines. Emerging as one of the greatest Olympic weightlifters of all time with three Olympic titles, Pyrros Dimas ended his illustrious sporting career with a bronze medal effort in the men's light heavyweight category on his fourth and final Olympic appearance. Meanwhile, Nikolaos Kaklamanakis, who won the gold in Atlanta eight years earlier, and lit the Olympic flame at the conclusion of the opening ceremony, picked up his second medal with a shimmering silver in men's Mistral windsurfing.";
  
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

            fs.writeFile("json_files/olympic_2004.json",JSON.stringify(obj), function(err) {     // we save the json file containing the input text, the 
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

