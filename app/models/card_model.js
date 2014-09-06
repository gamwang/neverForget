/**
 * Created by lijiahang on 14-9-6.
 */

exports.createNewCard = function(front, back){
    /* functionality of createNewCard
     * input: front: the string of the front side of card
              back: the string of the back side of card
     * output: return a card object with default attributes
     * Attributes of a card object
     *   {
     *       Front: String,
     *       Back: String,
     *       NextDate: Date,
     *       PrevDate: Date,
     *       Interval: Number,
     *       Repetition: Number,
     *       EF: Number
     *   };
     */

    var today = new Date();
    today.setHours(0,0,0,0);

    return {
        Front: front,
        Back: back,
        NextDate: today,
        PrevDate: today,
        Interval: 0,
        Repetition: 0,
        EF: 2.5
    };
};

exports.updateCard = function(card, grade) {
    /* functionality of updateCard
     * input: card: a card object
     *        grade: the grade the user scored, a number from 0 to 5
     * output: change the attributes of the card object according to
     *         Spaced Repetition algorithm (Edited From: https://github.com/joedel/spaced-repetition)
     */

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
};

exports.checkCardsDueToday = function(cards) {
    /* functionality of checkCardsDueToday
     * input: cards: an array of card objects that need to be checked
     * output: an array of card objects that has NextDate smaller than today
     */

    var today = new Date();
    var cardsDueToday = [];
    for (var i = 0; i < cards.length; i++) {
        if (cards[i].NextDate < today) cardsDueToday.add(cards[i]);
    }
    return cardsDueToday;
};