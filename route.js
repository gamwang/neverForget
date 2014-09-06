/**
 * Created by lijiahang on 14-9-6.
 */

module.exports = function(app){
    var note_control = require('./app/controllers/note_control');

    app.get('/', note_control.index);
};