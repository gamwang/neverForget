/**
 * Created by lijiahang on 14-9-6.
 */

var mongoose = require("mongoose");

var cardSchema = mongoose.Schema({
    ID: String,
    front: String,
    back: String,
    NextDate: Date,
    PrevDate: Date,
    Interval: Number,
    Repetition: Number,
    EF: Number
});

var cardModel = mongoose.model("cards", cardSchema);
var databaseRunning = false;

var connectToDatabase = function(){
    if (!databaseRunning) {
        mongoose.connect("mongodb://localhost/dev00");
        mongoose.connection.on("error", console.error.bind("Connection Failed: "));
        mongoose.connection.once("open", function () {
            console.log("[Database] Connection Success!")
        });
        databaseRunning = true;
    }
};

var updateCardWithoutDB = function(card, grade) {
    /* functionality of updateCard
     * input: card: a card object
     *        grade: the grade the user scored, a number from 0 to 5
     * output: change the attributes of the card object according to
     *         Spaced Repetition algorithm (Edited From: https://github.com/joedel/spaced-repetition)
     */
    var today = new Date();
    today.setHours(0,0,0,0);

    var oldEF = card.EF,
        newEF = 0,
        nextDate = new Date(today);

    if (grade < 3) {
        card.Repetition = 0;
        card.Interval = 0;
    } else {

        newEF = oldEF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
        if (newEF < 1.3) { // 1.3 is the minimum EF
            card.EF = 1.3;
        } else {
            card.EF = newEF;
        }

        card.Repetition = card.Repetition + 1;

        switch (card.Repetition) {
            case 1:
                card.Interval = 1;
                break;
            case 2:
                card.Interval = 6;
                break;
            default:
                card.Interval = Math.ceil((card.Repetition - 1) * card.EF);
                break;
        }
    }

    if (grade === 3) {
        card.Interval = 0;
    }

    nextDate.setDate(today.getDate() + card.Interval);
    card.PrevDate = card.NextDate;
    card.NextDate = nextDate;
    console.log(card);
    console.log("[Database] Above is the updated card!");
};

exports.getAllCards = function(_id, callback){
    var today = new Date();
    connectToDatabase();
    cardModel.find({ID:_id}, function(err, cards){
        if (err) console.error(err);
        console.log("[Database] Querying Success!");
        var due = [];
        var not_due = [];
        for (var i = 0; i < cards.length; i++){
           var card_obj = {
                front: cards[i].front,
                back: cards[i].back,
                EF: cards[i].EF
            };
            if (cards[i].NextDate < today) {
                due.push(card_obj);
            } else {
                not_due.push(card_obj);
            } 
        }
        var result = {due: due, not_due: not_due};
        if (callback) callback(result);
    });
};

exports.updateCard = function(_id, _front, score, next){
    connectToDatabase();
    cardModel.find({ID:_id, front: _front}, function(err, card){
	console.log(err);
        console.log(card);
        console.log("[Database] The above card is found");
        var card_obj = card[0];
        updateCardWithoutDB(card_obj, score);
        cardModel.remove({ID:_id, front: _front}, function(err){
            if (err) console.error(err);
            console.log("[Database] Old card removed");
            cardModel.create(card_obj, function(err, card){
                if (err) console.error(err);
                console.log(card);
                console.log("[Database] Updated card is saved!");
                if (next) next();
            });
        });
    });
};

exports.addCard = function(_front, _back, _id, next){
    /* functionality of createNewCard
     * input: front: the string of the front side of card
     back: the string of the back side of card
     * output: return a card object with default attributes
     * Attributes of a card object
     *   {
     *       front: String,
     *       back: String,
     *       NextDate: Date,
     *       PrevDate: Date,
     *       Interval: Number,
     *       Repetition: Number,
     *       EF: Number
     *   };
     */

    var today = new Date();
    today.setHours(0,0,0,0);

    var card = {
        ID: _id,
        front: _front,
        back: _back,
        NextDate: today,
        PrevDate: today,
        Interval: 0,
        Repetition: 0,
        EF: 2.5
    };

    connectToDatabase();

    cardModel.create(card, function(err, card){
        console.log(card);
        console.log("[Database] The above card is saved!");
        if (next) next();
    });
};
