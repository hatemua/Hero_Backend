
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPEKEY);
exports.createCustomer = async(email)=>{
    try {
        const customer = await stripe.customers.create({
            email
          });
        return customer;  
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          //in case error the function is false 
          return false;
    }
}

//function that retrives the customer
exports.retriveCustomer = async(customerId)=>{
    try {
        const customer = await stripe.customers.retrieve(
            customerId
        );
        return customer;  
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          //in case error the function is false 
          return false;
    }
}
//function that retrives the product
exports.retriveProduct = async(productId)=>{
    try {
        const product = await stripe.products.retrieve(
            productId
        );
        return product;  
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          //in case error the function is false 
          return false;
    }
}
//function that retrives the price
exports.retrivePrice= async(priceId)=>{
    try {
        const price = await stripe.prices.retrieve(
            priceId
        );
        return price;  
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          //in case error the function is false 
          return false;
    }
}


//function that creats a product
exports.createProduct = async(prodName,imgList,desc)=>{
    try {
        const product = await stripe.products.create({name: prodName ,images :imgList,description:desc});
        return product;  
        //returns the product object with id u can store it in db
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          //in case error the function is false 
          return false;
    }
}

//function that link a price to a product 
exports.addPrice = async(prodId,amount,curr,mode,duree)=>{
    var obj = {
        product: prodId,
        unit_amount: amount,
        currency: curr,
      };
    if(mode=="Subscription"){
        obj = {
            ...obj,
            recurring: {interval: duree||"month"}
        }
    }
    try {
        const price = await stripe.prices.create(obj);
        return price;  
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          //in case error the function is false 
          return false;
    }
}


