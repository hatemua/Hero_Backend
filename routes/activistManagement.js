var express = require('express');
const app = require('../app');
var router = express.Router();
var activistManagement = require("../utils/activistManagement")
var activist = require("../utils/activistWallet");
/* GET users listing. */
router.get('/', function (req, res, next) {
    const activistMng = new activistManagement();
    activistMng.getAllActivists().then((resp) => {
        res.send(JSON.stringify(resp));
    });
});
router.post('/', function (req, res, next) {

    const nom = req.body.nom;
    const prenom = req.body.prenom;
    const email = req.body.email;
    const numTel = req.body.numtel;
    const url = req.body.url;
    const activistWallet = req.body.wallet;
    const activistMng = new activistManagement();

    activistMng.addActivist(nom, prenom, email, numTel, url, activistWallet).then((resp) => {
        res.end(JSON.stringify(resp));
    })
});
router.get('/:address', function (req, res, next) {
    const activistWallet = req.params.address;
    const activistMng = new activistManagement();
    activistMng.searchActivistByAddress(activistWallet).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/search/:idactivist', function (req, res, next) {
    const id = req.params.idactivist;
    const activistMng = new activistManagement();
    activistMng.searchActivistById(id).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/searchprenom/:idactivist', function (req, res, next) {
    const id = req.params.idactivist;
    const activistMng = new activistManagement();
    activistMng.getPrenomActivistById(id).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/searchnom/:idactivist', function (req, res, next) {
    const id = req.params.idactivist;
    const activistMng = new activistManagement();
    activistMng.getNomActivistById(id).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/searchemail/:idactivist', function (req, res, next) {
    const id = req.params.idactivist;
    const activistMng = new activistManagement();
    activistMng.getEmailActivistById(id).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/searchnumtel/:idactivist', function (req, res, next) {
    const id = req.params.idactivist;
    const activistMng = new activistManagement();
    activistMng.getNumTelActivistById(id).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/searchurl/:idactivist', function (req, res, next) {
    const id = req.params.idactivist;
    const activistMng = new activistManagement();
    activistMng.getURLActivistBytId(id).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/nom/:address', function (req, res, next) {
    const wallet = req.params.address;
    const activistMng = new activistManagement();
    activistMng.getNomActivistByAddress(wallet).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/prenom/:address', function (req, res, next) {
    const wallet = req.params.address;
    const activistMng = new activistManagement();
    activistMng.getPrenomActivistByAddress(wallet).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/email/:address', function (req, res, next) {
    const wallet = req.params.address;
    const activistMng = new activistManagement();
    activistMng.getEmailActivistByAddress(wallet).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/numtel/:address', function (req, res, next) {
    const wallet = req.params.address;
    const activistMng = new activistManagement();
    activistMng.getNumTelActivistByAddress(wallet).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.get('/url/:address', function (req, res, next) {
    const wallet = req.params.address;
    const activistMng = new activistManagement();
    activistMng.getURLActivistBytAddress(wallet).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.put('/:address', function (req, res, next) {
    const wallet = req.params.address;
    const nom = req.body.nom;
    const prenom = req.body.prenom;
    const email = req.body.email;
    const numtel = req.body.numtel;
    const url = req.body.url;
    const activistMng = new activistManagement();
    activistMng.updateActivistByAddress(wallet, nom, prenom, email, numtel, url).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.put('/setnom/:address/:nom', function (req, res, next) {
    const wallet = req.params.address;
    const nom = req.params.nom;

    const activistMng = new activistManagement();
    activistMng.setNomActivistbyAddress(wallet, nom).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.put('/setprenom/:address/:prenom', function (req, res, next) {
    const wallet = req.params.address;
    const prenom = req.params.prenom;

    const activistMng = new activistManagement();
    activistMng.setPrenomActivistbyAddress(wallet, prenom).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.put('/setemail/:address/:email', function (req, res, next) {
    const wallet = req.params.address;
    const email = req.params.email;

    const activistMng = new activistManagement();
    activistMng.setEmailActivistbyAddress(wallet, email).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.put('/setnumtel/:address/:numtel', function (req, res, next) {
    const wallet = req.params.address;
    const numtel = req.params.numtel;

    const activistMng = new activistManagement();
    activistMng.setNumTelActivistbyAddress(wallet, numtel).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.put('/seturl/:address', function (req, res, next) {
    const wallet = req.params.address;
    const url = req.query.url;

    const activistMng = new activistManagement();
    activistMng.setUrlActivistbyAddress(wallet, url.toString()).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.delete('/:address', function (req, res, next) {
    const wallet = req.params.address;

    const activistMng = new activistManagement();
    activistMng.deleteActivistByAddress(wallet).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
router.delete('/deletetbyuser/:address', function (req, res, next) {
    const wallet = req.params.address;

    const activistMng = new activistManagement();
    activistMng.deleteActivistByOwnerByAddress(wallet).then((resp) => {
        res.send(JSON.stringify(resp));
    })
});
module.exports = router;
