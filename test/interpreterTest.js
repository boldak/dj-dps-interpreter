const interpreter = require("../src/script");
let commands = require("dj-dps-commands");

const script = `@async(promise:'p[0]')
<?json
{"index":0}
?>
set('data')
@sync(vars:['data[0]'], values:['data'])

@async(promise:'p[1]')
<?json
{"index":1}
?>
set('data')
@sync(vars:['data[1]'], values:['data'])
@all({{p}})
get('data')`;

// console.log(commands);

let context = {};
let state = {
    packages: commands
};
let dpsInterpreter = new interpreter(commands, script, context);
dpsInterpreter.run(dpsInterpreter.state()).then(console.log,console.log);