const stripe = require('stripe')(process.env.STRIPEKEY);

exports.createSession = async(req,res,next)=>{
  const mode = req.body.mode;
  const customerId = req.body.customerId;
  //{price:  req.body.priceId, quantity: 1}
  
  try {
    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.DOMAIN}${process.env.PORT}/?success=true`,
      cancel_url: `${process.env.DOMAIN}${process.env.PORT}?canceled=true`,
      line_items: req.body.items,
      mode: mode,
      customer : customerId
    });
    return res.status(200).json(session);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return err;
  }
  
}
exports.saveCard = async(req,res,next)=>{
  try {
    const {type,number,exp_month,exp_year,cvc,customerId} = req.body;
    const paymentMethod = await stripe.paymentMethods.create({
      type,
      card: {
        number,
        exp_month,
        exp_year,
        cvc,
      },
    });
    const paymentMethod2 = await stripe.paymentMethods.attach(
      paymentMethod.id,
      {customer: customerId}
    );
    const customer = await stripe.customers.update(
      customerId,
      {invoice_settings: {default_payment_method
          : paymentMethod.id}}
    );
  return res.status(200).json({customer});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return err;
  }
}

// exports.createPortalSession =  async (req, res) => {
//     // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
//     // Typically this is stored alongside the authenticated user in your database.
//     try {
//       const session_id= req.body.sessionId;
//       const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
  
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
//         return err;
//     }
    

// };   