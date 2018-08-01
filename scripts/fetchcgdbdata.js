const fs = require('fs');
const path = require('path');
const request = require('request');

const PathToPacks = path.join(__dirname, '../json/PackCard');
const PathToCards = path.join(__dirname, '../json/Card');

function getCGDBData() {
    const url = 'http://www.cardgamedb.com/deckbuilders/legendofthefiverings/database/L5C14-db.jgz';

    return new Promise((resolve, reject) => {
        request.get(url, function(error, res, body) {
            if(error) {
                return reject(error);
            }
            let cards;
            resolve(eval(body));
        });
    });
}

function createJSON(cardData) {
    let data = {};
    let name = cardData.name.toLowerCase().replace(/ō/gi, 'o').replace(/ū/gi, 'u');
    let type = cardData.type.toLowerCase();
    let text = cardData.text.replace(/<em class='bbc'><strong class='bbc'>/gi, "<em>").replace(/<\/strong><\/em>/gi, '</placeholder');
    text = text.replace(/<\/strong>:/gi, ':</b>').replace(/<br\/>/gi, '\n').replace(/&ndash;/gi, '–');
    text = text.replace(/strong class='bbc'/gi, "b").replace(/<\/strong>/gi, '</b>').replace(/em class='bbc'/gi, "i").replace(/<\/em>/gi, '</i>');
    text = text.replace(/<\/placeholder/gi, '</em>');
    text = text.replace(/\[Military\]/gi, '[conflict-military]').replace(/\[Politics\]/gi, '[conflict-political]');
    text = text.replace(/\[Air\]/gi, '[element-air]').replace(/\[Earth\]/gi, '[element-earth]').replace(/\[Fire\]/gi, '[element-fire]');
    text = text.replace(/\[Void\]/gi, '[element-void]').replace(/\[Water\]/gi, '[element-water]');
    let traits = cardData.traits ? cardData.traits.toLowerCase().split('. ') : [];
    for(let i = 0; i < traits.length; i++) {
        traits[i] = traits[i].replace('.', '').replace(' ', '-').replace(/ō/gi, 'o').replace(/ū/gi, 'u');
    }
    data.clan = cardData.clan.toLowerCase();
    data.cost = cardData.cost !== '' ? cardData.costnumeric : null;
    data.deck_limit = cardData.max;
    data.element = cardData.element || null;
    data.fate = cardData.fate !== '' ? parseInt(cardData.fate) : null;
    data.glory = cardData.glory !== '' ? parseInt(cardData.glory) : null;
    data.honor = cardData.startinghonor !== '' ? parseInt(cardData.startinghonor) : null;
    data.id = name.replace(/[' ]/g, '-');
    data.influence_cost = (type !== 'stronghold' && cardData.influence !== '') ? parseInt(cardData.influence) : null;
    data.influence_pool = type === 'stronghold' ? parseInt(cardData.influence) : null;
    data.military = (type !== 'attachment' && cardData.military !== '') ? cardData.militarynumeric : null;
    data.military_bonus = (type === 'attachment' && cardData.miiitary !== '') ? cardData.militarynumeric : null;
    data.name = cardData.name;
    data.political = (type !== 'attachment' && cardData.political !== '') ? cardData.politicalnumeric : null;
    data.political_bonus = (type === 'attachment' && cardData.political !== '') ? cardData.politicalnumeric : null;
    data.role_restriction = cardData.deckrestrictions ? cardData.deckrestrictions.split(' ')[0].toLowerCase() : null;
    data.side = (type === 'stronghold' || type === 'province') ? 'province' : cardData.deck.toLowerCase();
    data.strength = type === 'province' ? parseInt(cardData.strength) : null;
    data.strength_bonus = (type === 'stronghold' || type === 'holding') ? parseInt(cardData.strength) : null;
    data.text = text;
    data.traits = traits;
    data.type = type;
    data.unicity = cardData.unique === 'Y';

    fs.writeFile(path.join(PathToCards, data.id + '.json'), JSON.stringify([data], null, '\t'));
}

let packData = getCGDBData()
    .then(cards => {
        for(let card of cards) {
            if(card.setname === 'Elements Unbound') {
                createJSON(card);
            }
        }
    });