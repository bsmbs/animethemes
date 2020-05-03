# animethemes

/r/animethemes wiki parser to use with animethemes.moe.

## Usage
```
npm install animethemes-parser
```

Test: `npm test`

### Command line
```
node main.js
```

This will fetch and parse all themes for all animes available. Output: output.json

### In code

```js
const AnimeThemes = require('animethemes-parser');

const parser = new AnimeThemes()

parser.all() // Get ALL animes in /r/animethemes database (don't use it recklessy - it sends almost 30 requests to reddit, one per year + year list)
.then(themes => {
    let anime = themes.find(x => x.title == "Date A Live");
    let op = anime.themes.find(x => x.type == "opening");
    console.log(op.link); // https://animethemes.moe/video/DateALive-OP1.webm
})

parser.year(2013) // Get all animes from specific year
.then(animes => {
    let fripside = animes.find(x => x.id == "16049").themes[1]; // Railgun S
    console.log(fripside.name); // OP2 "eternal reality"
})
```