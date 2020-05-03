const axios = require('axios').default;
const cheerio = require('cheerio');
const fs = require('fs');

/**
 * @typedef {Object} Theme
 * @property {String} name Song type, number and title e.g. 
 * - OP1 "sister's noise"
 * @property {String} link Direct link to webm video on animethemes.moe
 * @property {String} type Song type
 * - opening
 * - ending
 */

/**
 * @typedef {Object} Anime
 * @property {String} id MyAnimeList ID
 * @property {String} title Anime title, usually in romaji
 * @property {String} year Anime release year or decade if 1999 or older (XXs, e.g. 90s) 
 * @property {Array<Theme>} themes Themes
 */

class ThemeParser {
    constructor() {
        this.baseUrl = 'https://reddit.com';
    }

    /**
     * Get all themes available
     * @returns {Promise<Array<Anime>>}
     */
    async all() {
        try {
            this.animes = [];
            let resp = await axios.get("https://reddit.com/r/AnimeThemes/wiki/year_index.json", {
                headers: {
                    "User-Agent": "animethemes-scraper 1.0"
                }
            })

            let html = resp.data.data.content_html;
            html = getHTML(html);
            this.$ = cheerio.load(html);

            let data = await this.parseLinks()

            return data;
        }
        catch(err) {
            throw err;
        }
    }

    /** 
     * Get all animes from a year
     * @param {Number} n Year
     * @returns {Promise<Array<Anime>>}
     */
    async year(n) {
        let animes = [];

        let y = await biribiri('/r/AnimeThemes/wiki/'+n)
    
        this.$ = y;
        
        y('h3').each((i, el) => { // Each series in year
            let parsed = this.parseAnime(el);
            parsed.year = n;
            animes.push(parsed);
        })
            
        return animes;
    }

    parseLinks() {
        return new Promise(async resolve => {
            let years = this.$('h3 a');
            this.finl = 0;

            years.each(async (i, yearElement) => { // Each year

                this.year(this.$(yearElement).attr('href').split('/')[4])
                .then(animes => {
                    this.animes = this.animes.concat(animes);
                    this.finl++;

                    if(this.finl == years.length) {
                        resolve(this.animes);
                    }
                })       
            });
        })

    }

    /**
     * @returns {Anime} 
     */
    parseAnime(dat) {
        let el = this.$(dat).children('a');
        let title = el.text()
        let malId = el.attr('href').split('/')[4];
        let next = this.$(dat).next();

        let theme = {
            id: malId,
            title
        }

        if (next.prop("tagName") == "P") {
            theme.themes = this.parseTable(next.next());
        } else if (next.prop("tagName") == "TABLE") {
            theme.themes = this.parseTable(next);
        }

        return theme;
    }

    parseTable(table) {
        if (table.prop('tagName') != "TABLE") {
            return this.parseTable(table.next())
        }

        let themes = [];

        table.children('tbody').children('tr').each(function (i) {
            const $ = cheerio.load(this);
            const td = $('td');
            let name = replaceAll(td.first().text(), "&quot;", "\"");
            let link = td.eq(1).children().first().attr('href');

            themes.push({
                name,
                link,
                type: (name.startsWith('OP') ? 'opening' : 'ending')
            })
        })

        return themes;
    }
}

if (require.main === module) {
    let parser = new ThemeParser();
    parser.all()
        .then(a => {
            fs.writeFileSync('./output.json', JSON.stringify(a))
            console.log("Parsed " + a.length  + " anime. Written to output.json")
        })
}

/** 
 * @param {string} href Wiki page path
 */
async function biribiri(href) {
    let resp = await axios.get("https://reddit.com" + href + ".json", {
        headers: {
            "User-Agent": "animethemes-scraper 1.0"
        }
    })

    return cheerio.load(getHTML(resp.data.data.content_html));
}

/**
 * @param {Cheerio} table Cheerio with loaded <table>
 */

function getHTML(str) {
    let html = replaceAll(str, "&lt;", "<")
    html = replaceAll(html, "&gt;", ">")
    return html;
}

/**
 * 
 * @param {*} str 
 * @param {*} find 
 * @param {*} replace 
 * @returns {string} replaced
 */
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

module.exports = ThemeParser;