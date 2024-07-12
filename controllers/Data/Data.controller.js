const { PurchaseModel, ItemModel, salesModel, partiesModel, user, CashBookModel, CategoryModel, UnitModel, BillModel } = require('../../Models/Export')
const { GenerateCode } = require('../../Helper/Utils')
const { MongoDuplicateKeyError, MongoValidationError } = require('../../Error/Mongo.error')
const { DateTime } = require('luxon');
const Sale = require('../../Models/Sales/Sales.model');
const mongoose = require('mongoose')

async function createItem(req, res) {
    const { itemName, unit, category, quantity, Mrp } = req.body;
    const code = GenerateCode('ITM');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newItem = await ItemModel.create([{
            UserId: req.userId,
            code,
            itemName,
            unit,
            category,
            quantity,
            Mrp
        }], { session });

        const updateUser = await user.findByIdAndUpdate(req.userId, { $push: { items: newItem[0]._id } }, { new: true }).session(session);

        if (!updateUser) {
            await session.abortTransaction();
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'Item created successfully' });
    } catch (error) {
        await session.abortTransaction();
        if (error.name === 'ValidationError') {
            return MongoValidationError(error, res);
        }
        if (error.code === 11000 && error.keyValue.itemName) {
            return MongoDuplicateKeyError(error, res);
        }
        if (error.code === 11000 && error.keyValue.code) {
            return MongoDuplicateKeyError(error, res, true);
        }
        console.error('Error creating item:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    finally {
        session.endSession();
    }
}

async function createPartie(req, res) {
    const { Name, type, contactNo, Address } = req.body;
    const PartieCode = GenerateCode('PAR');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newPartie = await partiesModel.create([{
            UserId: req.userId,
            PartieCode,
            Name,
            type,
            contactNo,
            Address
        }], { session });

        const updateUser = await user.findByIdAndUpdate(req.userId, { $push: { parties: newPartie[0]._id } }, { new: true }).session(session);

        if (!updateUser) {
            await session.abortTransaction();
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'Party created successfully', newPartie, updateUser });

    } catch (error) {
        await session.abortTransaction();
        if (error.name === 'ValidationError') {
            return MongoValidationError(error, res);
        }
        if (error.code === 11000 && error.keyValue.Name) {
            return MongoDuplicateKeyError(error, res);
        }
        if (error.code === 11000) {
            return MongoDuplicateKeyError(error, res, true);
        }
        console.error('Error creating party:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    finally {
        session.endSession();
    }
}

async function CreateCategory(req, res) {
    const { Name } = req.body;
    let name = Name.toUpperCase()

    try {
        const Category = await CategoryModel.create({
            UserId: req.userId,
            Name: name
        });

        const updateUser = await user.findByIdAndUpdate(req.userId, { $push: { Category: Category._id } }, { new: true });
        if (updateUser) {
            return res.status(200).json({ success: true, message: 'Category created successfully' });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            return MongoValidationError(error, res);
        }
        if (error.code === 11000) {
            return MongoDuplicateKeyError(error, res, false);
        }
        console.error('Error creating item:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

async function CreateUnit(req, res) {
    const { Name } = req.body;
    let name = Name.toUpperCase()
    try {
        const Unit = await UnitModel.create({
            UserId: req.userId,
            Name: name,
        });

        const updateUser = await user.findByIdAndUpdate(req.userId, { $push: { Unit: Unit._id } }, { new: true });
        if (updateUser) {
            return res.status(200).json({ success: true, message: 'Unit created successfully' });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            return MongoValidationError(error, res);
        }
        if (error.code === 11000) {
            return MongoDuplicateKeyError(error, res, false);
        }
        console.error('Error creating item:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

async function purchaseRegister(req, res) {
    const { partyName, items, totalAmount, type, Date, BillNum } = req.body
    console.log(req.body)
    const session = await mongoose.startSession();
    session.startTransaction();

    // const PartyName = await partiesModel.findOne({ UserId: req.userId, Name: partyName })
    // if (!PartyName) {
    //     return res.status(500).json({ success: false, message: "partie doesn't exist" });
    // }
    try {
        for (let i = 0; i < items.length; i++) {
            const ItemName = await ItemModel.findOne({ UserId: req.userId, itemName: items[i].itemName })

            const purchaseNo = GenerateCode('PUR')

            const purchaseEntery = await PurchaseModel.create([{
                UserId: req.userId,
                type,
                purchaseNo,
                itemName: items[i].itemName,
                partyName,
                unit: items[i].unit,
                quantity: items[i].quantity,
                rate: items[i].rate,
                // mrp,
                totalAmount,
                Date,
                BillNum
            }], { session })
            // console.log(ItemName._id, ItemName.itemName
            // )
            const updatedItem = await ItemModel.findByIdAndUpdate(ItemName._id, { $inc: { quantity: items[i].quantity } }, { new: true }).session(session);
        }
        const LastPurchaseDateUpdate = await user.findByIdAndUpdate(req.userId, {
            "extraData.LastPurchaseDate": Date
        }).session(session)
        if (!LastPurchaseDateUpdate) {
            throw new Error('not updated last sale date')
        }
        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'Purchase Entry created' });
    } catch (error) {
        await session.abortTransaction();
        if (error.name === 'ValidationError') {
            return MongoValidationError(error, res);
        }
        if (error.code === 11000 && error.keyValue.purchaseNo) {
            return MongoDuplicateKeyError(error, res, true);
        }

        if (error.code === 11000) {
            return MongoDuplicateKeyError(error, res, false);
        }

        console.error('Error creating purchaseEntry:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    finally {
        session.endSession();
    }
}

async function salesEntry(req, res) {
    const { partyName, saleType, items, discount, netPayable, modeOfPayment, total, Date, BillNum, Advance } = req.body

    console.log(req.body)
    // getting partyName
    const partie = await partiesModel.findOne({ UserId: req.userId, Name: partyName })
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        for (let i = 0; i < items.length; i++) {
            // console.log("obj:", items[i])
            const saleNo = GenerateCode('SAL')
            const ItemName = await ItemModel.findOne({ UserId: req.userId, itemName: items[i].itemName })
            const saleEntry = await salesModel.create([{
                UserId: req.userId,
                saleNo: saleNo,
                partyName: partyName,
                saleType: saleType,
                itemName: items[i].itemName,
                currentStock: items[i].currentStock,
                unit: items[i].unit,
                quantity: items[i].quantity,
                rate: items[i].Mrp,
                total: total,
                discount: discount,
                netPayable: netPayable,
                Date: Date,
                BillNum: BillNum
            }], { session });
            const updatedItem = await ItemModel.findByIdAndUpdate(ItemName._id, { $inc: { quantity: -items[i].quantity } }, { new: true }).session(session);
        }

        if (saleType === "Cash") {
            const CashCode = GenerateCode('CAS');
            const CashBook = await CashBookModel.create([{
                UserId: req.userId,
                ReceiptType: "paid",
                category: "Sale",
                Discription: `sale of ${netPayable} to ${partyName} `,
                Ammount: netPayable,
                code: CashCode,
                RefBillNo: BillNum
            }], { session })
            const updatedUser = await user.findByIdAndUpdate(req.userId, { $inc: { AmmountInStore: -netPayable } }, { new: true }).session(session);
        }
        else {
            const Bill = await BillModel.create([{
                UserId: req.userId,
                PartyData: partie._id,
                PartyName: partie.Name,
                billNumber: BillNum,
                totalAmount: netPayable,
                paidAmount: Advance,
                pendingAmount: netPayable - Advance
            }], { session })
        }
        const LastSaleDateUpdate = await user.findByIdAndUpdate(req.userId, {
            "extraData.LastSaleDate": Date
        }).session(session)
        if (!LastSaleDateUpdate) {
            throw new Error('not updated last sale date')
        }
        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'sales Entry created successfully' });

    } catch (error) {
        await session.abortTransaction();
        // console.log(error)
        if (error.name === 'ValidationError') {
            return MongoValidationError(error, res);
        }
        if (error.code === 11000 && error.keyValue.saleNo) {
            return MongoDuplicateKeyError(error, res, true);
        }
        if (error.code === 11000) {
            return MongoDuplicateKeyError(error, res, false);
        }

        // console.error('Error creating purchaseEntry:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    finally {
        session.endSession();
    }
}


async function CashBook(req, res) {
    const { Date, ReceiptType, category, RefBillNo, Ammount, Discription, PendingAmmount } = req.body

    console.log("hello", req.body)

    const code = GenerateCode('CAS')
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (category === "Sale") {
            console.log('sale workings')
            const CashBook = await CashBookModel.create([{
                UserId: req.userId,
                code,
                Date,
                ReceiptType,
                category,
                RefBillNo,
                Ammount,
                Discription,
            }], { session })
            const Bill = await BillModel.updateOne({ billNumber: RefBillNo }, {
                paidAmount: Ammount,
                pendingAmount: PendingAmmount - Ammount
            }).session(session)
            const updatedItem = await user.findByIdAndUpdate(req.userId, { $inc: { AmmountInStore: Ammount } }, { new: true }).session(session);
        }
        else {
            const CashBook = await CashBookModel.create([{
                UserId: req.userId,
                code,
                Date,
                ReceiptType,
                category,
                Ammount,
                Discription,
            }], { session })
            if (ReceiptType === "receive") {
                console.log('creddited')
                const updatedItem = await user.findByIdAndUpdate(req.userId, { $inc: { AmmountInStore: Ammount } }, { new: true }).session(session);
            }
            else {
                console.log('debit')
                const updatedItem = await user.findByIdAndUpdate(req.userId, { $inc: { AmmountInStore: -Ammount } }, { new: true }).session(session);

            }
        }
        const LastPurchaseDateUpdate = await user.findByIdAndUpdate(req.userId, {
            "extraData.LastCashBookDate": Date
        }).session(session)
        if (!LastPurchaseDateUpdate) {
            throw new Error('not updated last sale date')
        }
        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'Added to cashBook', });

    } catch (error) {
        await session.abortTransaction();
        if (error.name === 'ValidationError') {
            console.log('validate')
            return MongoValidationError(error, res);
        }
        if (error.code === 11000) {
            return MongoDuplicateKeyError(error, res, true);
        }

        console.error('Error creating CashBook:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    finally {
        session.endSession();
    }
}

async function intialCashInStore(req, res) {
    const { intialAmount } = req.body

    console.log(req.body)


    try {

        const updateUser = await user.findByIdAndUpdate(req.userId, { CashBook: true, AmmountInStore: intialAmount }).exec()
        if (!updateUser) {
            return res.status(500).json({ success: false, message: 'Something Went Wrong please try again' });
        }

        return res.status(200).json({ success: true, message: 'added' });

    } catch (error) {
        console.error('Error creating intailCashEntry:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}





// get data from db 
async function GetUserData(req, res) {
    try {
        const Items = await user.findById(req.userId).populate('parties')
            .populate('items')
            .populate('Category')
            .populate('Unit')
        if (!Items) {
            return res.status(500).json({ success: false, message: "something went wrong" });
        }
        return res.status(200).json({ success: true, message: "fetched successfully", Data: Items });
    } catch (error) {
        console.log('erro while getting item name', error)
        return res.status(500).json({ success: false, message: "internal server error" });

    }
}

async function GetPurchaseData(req, res) {
    let query = req.query
    console.log("query", req.userId)
    const dateObject = DateTime.fromISO(query.createdAt);


    if (query.skip) {
        query.skip = +query.skip
    }

    const TakeOutNUll = Object.entries(query).filter((i) => {
        return i[1] !== "" && i[0] !== "skip" && i[0] !== "isFilter"
    })

    const MatachQuery = Object.fromEntries(TakeOutNUll)
    console.log(MatachQuery)

    try {
        let Data = null
        if (query.isFilter === "true") {
            const data = await PurchaseModel.aggregate([
                {
                    $match: { ...MatachQuery, UserId: new mongoose.Types.ObjectId(req.userId) }
                },
                {
                    $sort: { createdAt: -1 }
                }
                ,
                {
                    $skip: query.skip
                },

                {
                    $limit: 10
                }
            ])
            Data = data
        }
        else {
            const data = await PurchaseModel.aggregate([
                {
                    $match: { UserId: new mongoose.Types.ObjectId(req.userId) }
                }
                ,
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $skip: query.skip
                },
                {
                    $limit: 10
                }
            ])
            Data = data
        }

        if (Data) {
            return res.status(200).json({ success: true, message: 'fetched data successfuly', data: Data, });
        }
        else {
            return res.status(500).json({ success: false, message: "internal server error" });
        }


    } catch (error) {
        console.log('erro while getting purchase regiseter data', error)
        return res.status(500).json({ success: false, message: "internal server error" });
    }

}

async function GetSalesData(req, res) {
    let query = req.query
    console.log("query:")
    const dateObject = DateTime.fromISO(query.createdAt);


    if (query.skip) {
        query.skip = +query.skip
    }

    console.log("skip:", query.skip)

    // converting them into array of each values and filter non vlaues
    const TakeOutNUll = Object.entries(query).filter((i) => {
        return i[1] !== "" && i[0] !== "skip" && i[0] !== "isFilter"
    })

    console.log('nul:', TakeOutNUll)
    const MatachQuery = Object.fromEntries(TakeOutNUll)
    console.log("matched", MatachQuery)
    try {
        let Data = null
        if (query.isFilter === "true") {
            const data = await Sale.aggregate([
                {
                    $match: { ...MatachQuery, UserId: new mongoose.Types.ObjectId(req.userId) }
                },
                {
                    $sort: { createdAt: -1 }
                }
                ,
                {
                    $skip: query.skip
                },

                {
                    $limit: 10
                }
            ])
            Data = data
        }
        else {
            const data = await Sale.aggregate([
                {
                    $match: { UserId: new mongoose.Types.ObjectId(req.userId) }
                }
                ,
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $skip: query.skip
                },
                {
                    $limit: 10
                }
            ])
            Data = data
        }

        if (Data) {
            console.log("datafromdb:", Data.length)
            return res.status(200).json({ success: true, message: 'fetched data successfuly', data: Data, });
        }
        else {
            return res.status(500).json({ success: false, message: "internal server error" });
        }


    } catch (error) {
        console.log('erro while getting purchase regiseter data', error)
        return res.status(500).json({ success: false, message: "internal server error" });
    }

}

async function GetCashBook(req, res) {
    let query = req.query
    console.log("query", query)
    const dateObject = DateTime.fromISO(query.createdAt);


    if (query.skip) {
        query.skip = +query.skip
    }

    const TakeOutNUll = Object.entries(query).filter((i) => {
        return i[1] !== "" && i[0] !== "skip" && i[0] !== "isFilter"
    })

    const MatachQuery = Object.fromEntries(TakeOutNUll)
    console.log("matched", MatachQuery)

    try {
        let Data = null
        if (query.isFilter === "true") {
            const data = await CashBookModel.aggregate([
                {
                    $match: { ...MatachQuery, UserId: new mongoose.Types.ObjectId(req.userId) }
                },
                {
                    $sort: { createdAt: -1 }
                }
                ,
                {
                    $skip: query.skip
                },

                {
                    $limit: 10
                }
            ])
            Data = data
        }
        else {
            console.log('working', req.userId)
            const data = await CashBookModel.aggregate([
                {
                    $match: { UserId: new mongoose.Types.ObjectId(req.userId) }
                }
                ,
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $skip: query.skip
                },
                {
                    $limit: 10
                }
            ])
            Data = data
        }

        if (Data) {
            return res.status(200).json({ success: true, message: 'fetched data successfuly', data: Data, });
        }
        else {
            return res.status(500).json({ success: false, message: "internal server error" });
        }


    } catch (error) {
        console.log('erro while getting purchase regiseter data', error)
        return res.status(500).json({ success: false, message: "internal server error" });
    }

}

async function BillNoData(req, res) {
    const { billNumber } = req.params
    console.log(billNumber)
    try {

        const data = await BillModel.findOne({ UserId: req.userId, billNumber: billNumber })
        if (data) {
            return res.status(200).json({ success: true, message: "Bill Found", data: data.pendingAmount });
        }
        else {
            return res.status(404).json({ success: false, message: "No Bill No Found" });
        }

    } catch (error) {
        console.log('erro while getting purchase regiseter data', error)
        return res.status(500).json({ success: false, message: "internal server error" });
    }
}

async function GetAllbills(req, res) {
    let query = req.query
    if (query.skip) {
        query.skip = +query.skip
    }
    console.log("qq", query)

    // taking out everthing that's not a query empty string isfilter and skip values
    const TakeOutNUll = Object.entries(query).filter((i) => {
        return i[1] !== "" && i[0] !== "skip" && i[0] !== "isFilter"
    })
    console.log("haa", TakeOutNUll)

    const MatachQuery = Object.fromEntries(TakeOutNUll)
    console.log("da", MatachQuery)

    try {
        let Data = null
        if (query.isFilter === "true") {
            console.log('yewaala')
            const data = await BillModel.aggregate([
                {
                    $match: { UserId: new mongoose.Types.ObjectId(req.userId), partyName: 'ashutosh', }
                },
                {
                    $sort: { createdAt: -1 }
                }
                ,
                {
                    $skip: query.skip
                },

                {
                    $limit: 10
                }
            ])
            Data = data
        }
        else {
            const data = await BillModel.aggregate([
                {
                    $match: { UserId: new mongoose.Types.ObjectId(req.userId), pendingAmount: { $gt: 0 } }
                }
                ,
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $skip: query.skip
                },
                {
                    $limit: 10
                }
            ])
            Data = data
        }

        if (Data) {
            console.log('dadfromdb:', Data)
            return res.status(200).json({ success: true, message: 'fetched data successfuly', data: Data, });
        }
        else {
            return res.status(500).json({ success: false, message: "internal server error" });
        }
    }
    catch (error) {
        console.log('erro while getting purchase Bill data', error)
        return res.status(500).json({ success: false, message: "internal server error" });
    }
}


// update data
async function UpdateItem(req, res) {
    // const { id, name } = req.query
    const { code, itemName, unit, category, quantity, Mrp, id } = req.body

    try {
        const UpdateItem = await ItemModel.updateOne({ _id: id }, {
            itemName,
            unit,
            category,
            quantity,
            Mrp
        });
        if (UpdateItem) {
            return res.status(200).json({ success: true, message: 'Item updated successfully' });
        }

    } catch (error) {
        if (error.name === 'ValidationError') {
            return MongoValidationError(error, res);
        }
        if (error.code === 11000 && error.keyValue.itemName) {
            return MongoDuplicateKeyError(error, res);
        }
        if (error.code === 11000 && error.keyValue.code) {
            return MongoDuplicateKeyError(error, res, true);
        }
        console.error('Error creating item:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

async function UpdatePartie(req, res) {
    const { Name, type, contactNo, Address, id } = req.body;
    console.log(req.body)
    try {
        const updatePartie = await partiesModel.updateOne({ _id: id }, {
            Name,
            type,
            contactNo,
            Address
        },);

        if (!updatePartie) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        return res.status(200).json({ success: true, message: 'Party updated successfully', });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return MongoValidationError(error, res);
        }
        if (error.code === 11000 && error.keyValue.Name) {
            return MongoDuplicateKeyError(error, res);
        }
        if (error.code === 11000) {
            return MongoDuplicateKeyError(error, res, true);
        }
        console.error('Error creating party:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Delete data
async function DeleteItem(req, res) {
    const { id } = req.body;
    console.log(id)

    try {
        const deleteResult = await ItemModel.findByIdAndDelete(id);
        if (deleteResult) {
            return res.status(200).json({ success: true, message: 'Item deleted successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

async function DeletePartie(req, res) {
    const { id } = req.body;

    try {
        const deleteResult = await partiesModel.findByIdAndDelete(id);

        if (!deleteResult) {
            return res.status(404).json({ success: false, message: 'Party not found' });
        }

        return res.status(200).json({ success: true, message: 'Party deleted successfully' });
    } catch (error) {
        console.error('Error deleting party:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = { createItem, createPartie, purchaseRegister, GetUserData, salesEntry, GetPurchaseData, GetSalesData, CashBook, intialCashInStore, GetCashBook, CreateCategory, CreateUnit, BillNoData, GetAllbills, UpdateItem, UpdatePartie, DeleteItem, DeletePartie }