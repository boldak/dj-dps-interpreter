const interpreter = require("../src/script");
let commands = require("dj-dps-commands");

const script = `
meta('$..dataset.topics')
distinct()
set('tg')

meta('$..dataset.label')
distinct()
translate()
set('ds')

<?javascript

  var dm = [];
  
  $context.ds.forEach(function(d, index){
    
    var row = [] 
    for(var i = 0; i<$context.ds.length; i++){ 
      row.push(
          _.intersection(
              $context.tg[index],
              $context.tg[i]).length
              )
    }
     var max = row[index]
     dm.push({
         key: $context.ds[index],
         values: row.map(function(v,ind){
             return {
                 label: $context.ds[ind],
                 value: v/max
                 
             }
         })
     })   
 })

  $context.dm = dm;

?>

get('dm')
cache()
`;

// console.log(commands);

let context = {};
let state = {
    packages: commands
};
let dpsInterpreter = new interpreter(commands, script, context);
dpsInterpreter.run();