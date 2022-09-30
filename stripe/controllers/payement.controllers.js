const stripe = require('stripe')(process.env.STRIPEKEY);
const { getPriceId,getCustomerId,mergeString } = require("../utils/utils");
const { getdriver,initDriver }=require("../../neo4j");
// const neo4j = require("neo4j-driver")
const moment =require("moment");
// const getTime = require("../../utils/getTime")
const path = require('path');
const writeXlsxFile = require('write-excel-file/node')
const handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const fs = require("fs");
const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    "112603853738-firv146ngs4te6uonb9s25bnk6a77bk3.apps.googleusercontent.com",
    "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",
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: "1//04WFBIcSeac0NCgYIARAAGAQSNwF-L9IrhMZted2r55axHJdBNsEzFAEC7ue7ehloeMSHtmUzjOlNWsR4cmVWQkP2wZKhpOI6Roo"
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject();
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "hi@hero-labs.co",
      accessToken,
      clientId: "1//04WFBIcSeac0NCgYIARAAGAQSNwF-L9IrhMZted2r55axHJdBNsEzFAEC7ue7ehloeMSHtmUzjOlNWsR4cmVWQkP2wZKhpOI6Roo",
      clientSecret: "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",
      refreshToken: "1//04WFBIcSeac0NCgYIARAAGAQSNwF-L9IrhMZted2r55axHJdBNsEzFAEC7ue7ehloeMSHtmUzjOlNWsR4cmVWQkP2wZKhpOI6Roo"
    }
  });

  return transporter;
};
const HEADER_ROW = [
  {
    value: 'Activist email',
    fontWeight: 'bold'
  },
  {
    value: 'amount',
    fontWeight: 'bold'
  },
  {
    value: 'IBAN',
    fontWeight: 'bold'
  },
  {
    value : "Cercle",
    fontWeight: 'bold'
  }
]
exports.createSession = async(req,res,next)=>{
  // const {mode,customerId,amount,idActivist}= req.body; for later changement
  const {mode,customerId,amount,grName}= req.body;
  //{price:  req.body.priceId, quantity: 1}
  try{
    await initDriver();
    var driver = getdriver();
    var sessione= driver.session({
      database: process.env.DBNAME ||'Hero'
    })
    const result = await sessione.run("match(c:Customer{CustomerId:$customerId})-[l:JOINED{amount:$amount}]-(g:Groupe{Name:$grName}) return l",{
      customerId,
      amount,
      grName
    })
    if(result.records.length > 0 ){
      return res.status(400).json("Already subscribed with this plan !");
    }
    const priceId = await getPriceId(amount);
  console.log(priceId);
    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.DOMAIN}8080/success?session_id={CHECKOUT_SESSION_ID}&grName=${grName}`,
      cancel_url: `https://herocircle.app/circle-feed`,
      line_items: [{
        price:priceId,
        quantity:1
      }],
      mode: mode,
      payment_method_types:["card","ideal"],
      currency: 'eur',
      customer : customerId
    });
    console.log(session)
    return res.status(200).json(session);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log(err)
  }
  
}

exports.successPage = async (req, res) => {
  // const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
 
  // return res.status(200).json(session);
  const {grName}= req.query;
  console.log(req.query.grName);
  const sessione = await stripe.checkout.sessions.retrieve(req.query.session_id);
  await initDriver();
  var driver = getdriver();
  var session = driver.session({
    database: process.env.DBNAME ||'Hero'
  })
  const customer = await stripe.customers.retrieve(sessione.customer);
  const ind = mergeString(customer.id,grName,new Date(),sessione.amount_total);
  const ed = moment().add(30, 'days').calendar();
  const today = moment().format();
  const resu = await session.run("match(t:Transaction{Index:$ind})return t",{
    ind
  })
  if(resu.records.length>0){
    return res.status(200).json({message:"already transaction added !"});
  }
  const bwf = sessione.amount_total - ((sessione.amount_total*15)/100);
  await session.run("merge(t:Transaction{From:$fr,To:$to,Amount:$amount,SentDay:$today,Subscribed:$sub,EndDay:$ed,Transfered:$tr,Index:$in})",{
    fr:customer.id,
    to:grName,
    amount:bwf,
    today,
    ed,
    sub:true,
    tr:false,
    in:ind
  });
  const resul = await session.run("match(c:Customer{CustomerId:$ci})match(g:Groupe{Name:$grName}) merge(c)-[:JOINED{amount:$amount,date:$date}]->(g) return c",{
    ci:customer.id,
    grName,
    amount :sessione.amount_total,
    date:moment().format()
  })
  const supporter = resul.records[0].get("c").properties;
  await session.run("match(h:Holder)set h.balance=h.balance+$amount,h.nTransactions=h.nTransactions	+1 with h as h match(t:Transaction{SentDay:$ed}) merge(h)-[:GOT]->(t)",{
    ed:today,
    amount:sessione.amount_total
  });
  
  const result = await session.run("match(g:Groupe{Name:$grName})set g.balance=g.balance+$bwf return g",{
    grName,
    bwf
  })
  const groupe = result.records[0].get("g").properties;
  const sendEmail = async (emailOptions) => {
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
};
const html = fs.readFileSync(path.join(__dirname,"emailTemplates","welcomeUK.html"), 'utf8');
var handlebarsTemplate = handlebars.compile(html);
var handlebarsObj = {
    groupe:groupe.Name,
    name:supporter.name,
};
var compiledData = handlebarsTemplate(handlebarsObj)
sendEmail({
    subject: "Welcome to "+groupe.name+" !",
    html:compiledData,
    text:"Welcome !",
    to: supporter.email,
    from: "hi@hero-labs.co"
  });

  
  return res.redirect('https://herocircle.app/welcome-circle:'+grName.replace(":",""));

}

// exports.createPortalSession =  async (req, res) => {
//     // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
//     // Typically this is stored alongside the authenticated user in your database.
//     try {
//       const session_id= req.body.sessionId;
//       const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
//       console.log(checkoutSession)
//     // This is the url to which the customer will be redirected when they are done
//     // managing their billing with the portal.
  
//       const portalSession = await stripe.billingPortal.sessions.create({
//         customer: checkoutSession.customer,
//         return_url: `${process.env.DOMAIN}${process.env.PORT}`,
//       });
  
//       return res.status(200).json(portalSession)
//       } catch (err) {
//         if (!err.statusCode) {
//           err.statusCode = 500;
//         }
//         return res.status(500).json(err)
//     }
    

// };   


exports.monthPay = async(req,res,next)=>{
  var EXCELDATA = [
    HEADER_ROW
  ];

  await initDriver();
  var driver = getdriver();
  var session = driver.session({
    database: process.env.DBNAME ||'Hero'
  })

  var result = await session.run("match(c:Groupe) return c");
  for (let record of result.records){
    var groupe = record.get("c").properties;
    var result = await session.run("match(c:Groupe{Name:$name})<-[:PART_OF]-(a:Activist) return a",{
      name:groupe.Name
    });
    if(groupe.members >0 && groupe.balance>0 ){
      var activistAmount = parseInt((groupe.balance / groupe.members)/100);
    var groupeBalance = groupe.balance;
    var amountRemovedFromStore = parseInt(groupeBalance + ((groupeBalance*15)/100));
    let data_row = [];
    for(let activistD of result.records){
      var activist = activistD.get("a").properties;
      console.log(activist)
      
      data_row.push(
        {
            value: activist.email
        },
        {
          value: activistAmount
        },
        {
          value : ""
        },
        {
          value : groupe.Name
        }
      )
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: activistAmount,
      //   currency: 'usd',
      //   transfer_data: {
      //     destination: activist.accountId,
      //   },
      // });
    }
    EXCELDATA.push(data_row)

    await session.run("match(h:Holder) set h.balance= h.balance - $amount",{
      amount:amountRemovedFromStore 
    });
    }
    

    
  }
  await writeXlsxFile(EXCELDATA, { // (optional) column widths, etc.
    filePath: path.join("excel","file.xlsx")
  })
  return res.status(200).json("EXcel file is ready !")
}


// exports.handleWebhooks= async(request,response)=>{
//   const sig = request.headers['stripe-signature'];
  
//   const endpointSecret = "whsec_36bdc93754b80d5a5caa4d229d3f20c92edfdb0f67dfdad6409108e1b1921ee0";

//   let event;
//   try {
//     event = await stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//   } catch (err) {
//     console.log(err.message)
//     response.status(400).send(`Webhook Error: ${err.message}`);
//     return;
//   }

//   // Handle the event
//   console.log(event)
//   console.log(event.type)
//   switch (event.type) {
//     case 'customer.subscription.updated':
//       const subscription = event.data.object;
//       console.log(" plan canceled !")
//       break;
//     // ... handle other event types
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   response.send();
// }