const assert = require('assert');
const ThemeParser = require('..');

describe('ThemeParser', function() {
    describe('#all()', function() {
        this.timeout(0);
        this.slow(10000);

        it('should fetch and parse themes', function(done) {
            new ThemeParser()
            .all()
            .then(data => {
                let d = data.find(x => x.title == "Date A Live III");
                let e = data.find(x => x.title == "Neon Genesis Evangelion");
                let h = data.find(x => x.title == "Higurashi no Naku Koro ni");
                if(d && e && h) done();
                else if(d || e || h) done("Output is incomplete");
            })
            .catch(err => done(err));
        })
    })
})