const PurchaseModel = require('../Models/Purchase/Purchase.model');
const ItemModel = require('../Models/Item/Item.model');
const salesModel = require('../Models/Sales/Sales.model');
const partiesModel = require('../Models/parties/Parties.model');
const user = require('../Models/User/User.model')
const CashBookModel = require('../Models/CashBook/CashBook.model')
const CategoryModel = require('./Category/Category.model')
const UnitModel = require('./Unit/Unit.model')
const BillModel = require('./Bill/Bill.model')


module.exports = { PurchaseModel, ItemModel, salesModel, partiesModel, user, CashBookModel, CategoryModel, UnitModel, BillModel }