/**
 * Created by lijiahang on 14-9-6.
 */

module.exports = function(app){
    var card_control = require('./app/controllers/card_control');

    app.get('/', card_control.index);
};