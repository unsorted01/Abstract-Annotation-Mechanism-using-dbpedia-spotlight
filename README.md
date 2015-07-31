**Abstract Annotation Mechanism**
====================================================

Each of this scripts takes a text as input and finds the most important entities using dbpedia-spotlight (language: english,  confidence: 0.5, support: 0). 
After that, for every entity, usings its dbpedia page, an abstract is inserting with important informations about the entity.
Finally a json file saved in folder "json_files" containing the input text and other information about the annotated entities, including the abstracts.

The node packages which used are:

1. dbpedia-spotlight    --     https://github.com/dbpedia-spotlight/DBpediaSpotlight.js/tree/master

2. cheerio              --     https://github.com/cheeriojs/cheerio

3. request              --     https://github.com/request/request
