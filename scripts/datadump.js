const fs = require('fs');
const path = require('path');

const PathToPacks = path.join(__dirname, '../json/PackCard');
const PathToCards = path.join(__dirname, '../json/Card');
const OutputFile = path.join(__dirname, 'datadump.json');

function getPackData() {
    let packs = {};
    let packfiles = fs.readdirSync(PathToPacks).filter(file => file.endsWith('.json'));
    for(let file of packfiles) {
        let packid = file.replace('.json', '');
        packs[packid] = {};
        let data = require(path.join(PathToPacks, file));
        for(let card of data) {
            packs[packid][card.card_id] = card;
        }
    }
    
    return packs;
}

function getCardData() {
    let cards = {};
    let cardfiles = fs.readdirSync(PathToCards).filter(file => file.endsWith('.json'));
    for(let file of cardfiles) {
        let cardid = file.replace('.json', '');
        let data = require(path.join(PathToCards, file));
        cards[cardid] = data[0];
    }

    return cards;
}

function writeData() {
    let packs = getPackData();
    let cards = getCardData();

    for(const packid of Object.keys(packs)) {
        for(const cardid of Object.keys(packs[packid])) {
            if(!cards[cardid]) {
                console.log('No card data for', cardid);
            } else {
                for(const prop of Object.keys(cards[cardid])) {
                    if(cards[cardid][prop] === null) {
                        delete cards[cardid][prop]
                    }
                }
                let packData = packs[packid][cardid];
                delete packData.card_id;
                packData.pack = { id: packid };
                if(cards[cardid].pack_cards) {
                    cards[cardid].pack_cards.push(packData);
                } else {
                    cards[cardid].pack_cards = [packData];
                }
            }
        }
    }
    let cardArray = Object.values(cards);

    fs.writeFile(OutputFile, JSON.stringify({ records: cardArray, size: cardArray.length, success: true }, null, '\t'));
}

writeData();