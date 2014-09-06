var Evernote = require('evernote').Evernote;
var _ = require('underscore');
var async = require('async');
var libxmljs = require('libxmljs');

var config = require('../config');

var oauthTokenSecret = config.secret; 
var oauthToken = config.authToken;
var oauthVerifier = config.id;


module.exports = {
    getNotes: function(req, res, next) {
        var query = req.body.url || 'dev00'; 
        var client = new Evernote.Client({
            consumerKey: oauthVerifier,
            consumerSecret: oauthTokenSecret,
            sandbox: true,
            token: oauthToken
        });
        var noteStore = client.getNoteStore();
        noteStore.listNotebooks(function(err, notebooks) {
            _.each(notebooks, function(notebook) {
                if (notebook.name == query) {
                    noteStore.findNotes(oauthToken, notebook, 0, 1000, function(err, notes) {
                        if (notes) {
                            fns = [];
                            var output = {
				due: {},
   				not_due: {}
};
                            cb = function() {
                                res.send(output);
                            };
                            _.each(notes.notes, function(note) {
                               
                                fns.push(function(done) {
                                    noteStore.getNote(oauthToken, note.guid, true, true, true, true, function(err, data) {
                                        var parsed = libxmljs.parseXml(data.content).root().text();

                                        output.due[note.title] = parsed;
                                        
                                        done();
                                    });
                                });
                            });
                            async.parallel(fns,cb);
                        } else {
                            console.log('something is wrong');
                        }
                    });
                    
                }
                
            });
        });
   }
};

