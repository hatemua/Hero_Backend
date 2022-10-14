var neo4j = require('neo4j-driver');
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPEKEY);
const { getdriver,initDriver } = require("../../neo4j");
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
        const product = await stripe.products.create({name: prodName ,description:desc});
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

exports.getPriceId = async(amount)=>{
    try {
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
            database: process.env.DBNAME ||'Hero',
        })
        const result = await session.run("match(pr:Price{amount:$amount}) return pr.priceId as prId",{
            amount
          });
          if (result.records.length == 0)
          {
            var name = "";
            var desc = "";
            if(amount>=1000 && amount<2000){
                name = "STARTER";
                desc = "HERO starter";
            }else if(amount >=2000 && amount <5000 ){
                name = "ADVOCATE";
                desc = "HERO advocate";
            }else{
                name = "HERO CHANGER";
                desc = "Everything on HERO Advocate + Interactions";
            }

            let price = await this.addPrice (productId,amount,"eur","Subscription",'month');
            console.log(price);
            await session.run("merge(g:Product{Name:$Name,productId:$productId})-[k:HAVE]->(s:Price{amount:$amount,priceId:$priceId})",{
                Name:"prod"+amount,
                productId:product.id,
                amount:amount,
                priceId:price.id
              });
            return price.id;
          }
          else
          {
            return result.records[0].get("prId");
        }
   } catch (error) {
        console.log(error)
        return false;
    
   }
}
exports.getCustomerId = async(email)=>{
    try {
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
            database: 'neo4j',
            defaultAccessMode: neo4j.session.READ
        })
          const result = await session.run("match(pe:Customer{Email:$email})return pe.CustomerId as ci",{
            email
          });
    
    
          return result.records[0].get("ci");
    } catch (error) {
        return false;
    }
}

exports.createAccount = async(country,email,day,month,year,fn,gender,idNumber,ln,phone,city,line1,line2,postal_code,state,ssn_last_4)=>{
    try {
        const account = await stripe.accounts.create({
            type: 'custom',
            country,
            email,
            business_type:"individual",
            tos_acceptance:{
                date:Math.floor(Date.now() / 1000),
                ip:"8.8.8.8",
                service_agreement:"full"
              },
              individual:{
                address:{
                    city,
                    country,
                    line1,
                    line2
                },
                dob:{
                    day,
                    month,
                    year
                },
                email,
                first_name:fn,
                last_name:ln,
                gender,
                id_number:idNumber,
                phone,
                // ssn_last_4,
              },
            capabilities: {
              card_payments: {requested: true},
              transfers: {requested: true}
            },
          });
          
          return account;  
        } catch (err) {
            console.log(err)
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              //in case error the function is false 
              return false;
        }
}
exports.mergeString = (from,to,date,amount)=>{
    const fr = from.slice(12);
    var month = date.getMonth()+1;
    var year = date.getFullYear();
    console.log(fr+to+month+year+amount)
    year.toString();
    month.toString();
    amount.toString();
    return fr+to+month+year+amount
}