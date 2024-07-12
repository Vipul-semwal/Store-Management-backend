var express = require('express');
var router = express.Router();
const moongoesConnect = require('../config/Mongo.config')
const { SignIn, SignUP, logout, GoogleAUth, verifyUser, VerifyAuthentication } = require('../controllers/Auth/Auth.controller')
const { createItem, createPartie, purchaseRegister, GetUserData, salesEntry, GetPurchaseData, GetSalesData, GetCashBook, CashBook, intialCashInStore, CreateCategory, CreateUnit, BillNoData, GetAllbills, UpdateItem, UpdatePartie, DeleteItem, DeletePartie } = require('../controllers/Data/Data.controller')
const { getUserIdFromCookie } = require('../middleware/middleware')
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Authentication
router.post('/sign-up', SignUP);
router.post('/sign-in', SignIn);
router.get('/logout', logout);
router.get('/verify/:id', verifyUser)


// creating and updating
router.post('/add-partie', getUserIdFromCookie, createPartie)
router.post('/add-item', getUserIdFromCookie, createItem)
router.post('/purchase-item', getUserIdFromCookie, purchaseRegister)
router.post('/sales-entry', getUserIdFromCookie, salesEntry)
router.post('/add-to-cash-book', getUserIdFromCookie, CashBook)
router.post('/inital-amout-cash-book', getUserIdFromCookie, intialCashInStore)
router.post('/create-catagory', getUserIdFromCookie, CreateCategory)
router.post('/create-unit', getUserIdFromCookie, CreateUnit)

// Get data form db
router.get('/get-data', getUserIdFromCookie, GetUserData)
router.get('/get-purchase-data', getUserIdFromCookie, GetPurchaseData)
router.get('/get-sales-data', getUserIdFromCookie, GetSalesData)
router.get('/get-cash-book-data', getUserIdFromCookie, GetCashBook)
router.get('/get-bill-no/:billNumber', getUserIdFromCookie, BillNoData)
router.get('/get-all-bill', getUserIdFromCookie, GetAllbills)

// updatig
router.put('/update-item', getUserIdFromCookie, UpdateItem)
router.put('/update-partie', getUserIdFromCookie, UpdatePartie)

// Deleting
router.delete('/delete-item', getUserIdFromCookie, DeleteItem)
router.delete('/delete-partie', getUserIdFromCookie, DeletePartie)


module.exports = router;
