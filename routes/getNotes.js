var Evernote = require('evernote').Evernote;
var _ = require('underscore');
var async = require('async');
var libxmljs = require('libxmljs');
var makeNote = require('../makeNote');

var card_model = require('../card_model');
var config = require('../config');

var oauthTokenSecret = config.secret;
var oauthToken = config.authToken;
var oauthVerifier = config.id;

function normalized_score(score) {
    if (score == 1) return 0;
    if (score == 2) return 3;
    else return 5;
}

function getGuid(token, title, cb) {
    var client = new Evernote.Client({
        sandbox: true,
        token: token
    });
    var noteStore = client.getNoteStore();
    noteStore.listNotebooks(function(err, notebooks) {
        _.each(notebooks, function(notebook) {
            if (notebook.name == title) {
                cb(notebook.guid);
            }
        });
    });
}

function getNotebook(token, title, cb) {
    var client = new Evernote.Client({
        sandbox: true,
        token: token
    });
    var noteStore = client.getNoteStore();
    noteStore.listNotebooks(function(err, notebooks) {
        _.each(notebooks, function(notebook) {
            if (notebook.name == title) {
                cb(notebook);
            }
        });
    });
}

module.exports = {
    getNotes: function(req, res, next) {
        var query = req.params.name;
        var token = req.params.token;
        var client = new Evernote.Client({
            sandbox: true,
            token: token
        });
        var noteStore = client.getNoteStore();
        card_model.getAllCards(query, function(data) {
            res.send(data);
        });
        /**
        noteStore.listNotebooks(function(err, notebooks) { 
            _.each(notebooks, function(notebook) {
                if (notebook.name == query) {
                    noteStore.findNotes(token, notebook, 0, 1000, function(err, notes) {
                        if (notes) {
                            fns = [];
                            var output = {
                                due: [],
                                not_due: []
                            };
                            cb = function() {
                                res.send(output);
                            };
                            _.each(notes.notes, function(note) {
                                fns.push(function(done) {
                                    noteStore.getNote(token, note.guid, true, true, true, true, function(err, data) {
                                        var parsed = libxmljs.parseXml(data.content).root().text();
                                        if (note.notebookGuid == notebook.guid) {
                                            output.due.push({
                                                front: note.title,
                                                back: parsed
                                            });
                                        }
                                        done();
                                    });
                                });
                            });
                            async.parallel(fns, cb);
                            card_model.getAllCards(query, function(data) {
                                res.send(data);
                            });
                        } else {
                            console.log('something is wrong');
                        }
                    });
                }
            });
        });
        */
    },
    updateNote: function(req, res, next) {
        var body = req.body;
        var user_id = body.id;
        var front = body.front;
        var score = normalized_score(body.score);
        var token = body.token;

        // connect db here 
        card_model.updateCard(user_id, front, score);
        res.send('post completed');
        //TODO: Jon Bai update the evernote with EP(easines point)
        /**
        getGuid(token, user_id, function(notebook_id) {
            // connect db here
            card_model.addCard(front, back, id);
            var client = new Evernote.Client({
                sandbox: true,
                token: token
            });
            var noteStore = client.getNoteStore();
            makeNote(noteStore, front, back, notebook_id, function(err, note) {
                noteStore.createNote(note);
            });
        });
        */
    },
    addNote: function(req, res, next) {
        var body = req.body;
        var token = body.token;
        var user_id = body.id;
        var front = body.front;
        var back = body.back;
        console.log(JSON.stringify(body));
        getNotebook(token, user_id, function(notebook) {
            // connect db here
            card_model.addCard(front, back, user_id);
            var client = new Evernote.Client({
                sandbox: true,
                token: token
            });
            var noteStore = client.getNoteStore();
            makeNote(noteStore, front, back, notebook, function(note) {
                noteStore.createNote(token, note, function(note) {
                    res.send('post completed');
                });
            });
        });

    }
};
