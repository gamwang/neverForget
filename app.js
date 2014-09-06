var Evernote = require('evernote').Evernote;
var _ = require('underscore');

var config = require('./config');

var oauthTokenSecret = config.secret; 
var oauthToken = config.authToken;
var oauthVerifier = config.id;

var client = new Evernote.Client({
      consumerKey: 'gamwang',
      consumerSecret: 'd15970aabcf71e2e',
      sandbox: true,
      token: oauthToken
});

var noteStore = client.getNoteStore();
noteStore.listNotebooks(function(err, notebooks) {
    _.each(notebooks, function(notebook) {
        console.log(notebook.name);
        noteStore.findNotes(oauthToken, notebook, 0, 3, function(err, note) {
            console.log(note.name);
        });
    });
});
