const Order = require('../models/Order');
const express = require('express');
let router = express.Router();
const Cart = require('../models/Cart');
const authorization = require('../middleware/authorization');
const admin = require('../middleware/admin');
const sendEmail = require('../utilis/sendEmail');
//Create Order
router.post('/newOrder', authorization, async (req, res) => {
  const { orderItems, address, amount } = req.body;

  const newOrder = await Order.create({
    orderItems,
    address,
    amount,
    paidAt: Date.now(),
    user: req.user._id,
  });
  try {
    const savedOrder = await newOrder.save();
    await Cart.findOneAndDelete({ user: req.user._id });
    return res.status(200).json(savedOrder);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//custom order
// router.post('/post', authorization, async (req, res) => {
//    const { orderItems, address,phoneNo,amount, type } = req.body;
//    const newOrder = await Order.create({
//     orderItems,
//     address,
//     phoneNo,
//     amount,
//     type,
//     paidAt: Date.now(),
//     user: req.user._id,
//   });
//   try {
//     const savedOrder = await newOrder.save();
//     await Cart.findOneAndDelete({ user: req.user._id });
//     return res.status(200).json(savedOrder);
//   } catch (err) {
//     return res.status(500).json(err);
//   }
//   //  console.log(phoneNo);
// // console.log({ orderItems, address,amount, type })


// });

router.post("/NewCustomOrders",authorization,async(req,res)=>{
  //res.send("ok")
  // const { orderItems, address,amount, type } = req.body;
  const { orderItems, address,phoneNo,amount, type } = req.body;
  const newOrder = await Order.create({
    orderItems,
    address,
    phoneNo,
    amount,
    type,
    paidAt: Date.now(),
    user: req.user._id,
  });
  try {
    const savedOrder = await newOrder.save();
    await Cart.findOneAndDelete({ user: req.user._id });
    return res.status(200).json(savedOrder);
  } catch (err) {
    return res.status(500).json(err);
  }
  // console.log({phoneNo});

}
  )

//Get Logged in User all Order---->My Order
router.get('/myorders', authorization, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json(err);
  }
});
//get user single order
router.get('/myfind/:id', authorization, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );
    if (!order) {
      return res.status(404).json('No Order Found Against this id');
    }
    return res.status(200).json(order);
  } catch (err) {
    return res.status(500).json(err);
  }
});





//get user single order--->new
router.get('/mysinglefind/:id', authorization, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json('No Order Found Against this id');
    }
    return res.status(200).json(order);
  } catch (err) {
    return res.status(500).json(err);
  }
});


//Update Order Status
// router.put('/status/:id', async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json('No Order Found Against this id');
//     } else {
//       if (order.status === 'pending') {
//         await Order.findOneAndUpdate(order._id, { status: 'Processing' });
//         return res.status(200).json('Order Status Updated Successfully');
//       } else if (order.status === 'Processing') {
//         await Order.findOneAndUpdate(order._id, { status: 'Delievered' });
//         return res.status(200).json('Order Status Updated Successfully');
//       }
//       return res.status(400).json('Order Could Not be  Updated ');
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json('Internal Server Error ');
//   }
// });



//Update Order Status
// router.put('/status/:id', async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json('No Order Found Against this id');
//     } else {
//      
//         await Order.findOneAndUpdate(order._id, { status: 'Processing' });
//         return res.status(200).json('Order Status Updated Successfully');
//       } else if (order.status === 'Processing') {
//         await Order.findOneAndUpdate(order._id, { status: 'Delievered' });
//         return res.status(200).json('Order Status Updated Successfully');
//       }
//       return res.status(400).json('Order Could Not be  Updated ');
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json('Internal Server Error ');
//   }
// });



router.put('/cancel/:_id', authorization, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params._id });

    if (!order) {
      return res.status(404).json('No Order Found Against this id');
    } 
    
    
    else {
      
        await Order.findByIdAndUpdate(order._id, { status: "Cancelled" });
        return res.status(200).json('Order Cancel Successfully');
    }
     
    }
   catch (error) {
    console.log(error);
    return res.status(500).json('Internal Server Error ');
  }
});



// get 

//Get Logged in User all Order---->My Order
router.get('/adminorders/:_id', authorization,admin, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params._id });
    console.log(orders)
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json(err);
  }
});














router.put('/status/:_id', authorization, admin, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params._id });

    if (!order) {
      return res.status(404).json('No Order Found Against this id');
    } else {
      if (order.status === 'Pending') {
        await Order.findByIdAndUpdate(order._id, { status: req.body.status });
        return res.status(200).json('Order update Successfully');
      } else if (order.status === 'Processing') {
        await Order.findByIdAndUpdate(order._id, {
          status: req.body.status,
          deliveredAt: new Date(),
        });
        return res.status(200).json('Order Update Successfully');
        
      }
      else if (order.status === 'Delivered') {
        await Order.findByIdAndUpdate(order._id, {
          status: req.body.status,
          deliveredAt: new Date(),
        });
        return res.status(200).json('Order Update Successfully');
        
      }
      return res.status(400).json('Order Could Not be  Updated ');
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json('Internal Server Error ');
  }
});

//get all orders
// router.get('/allorders1', authorization, admin,async (req, res) => {
//   try {

//     const orders = await Order.find();

//     return res.json( orders );;
//     //console.log(orders.length)

//     //return res.status(200).json(orders);
//   } catch (err) {
//     return res.status(500).json('Internal Server Error');
//   }
// });

//get all orders
router.get('/allorders', authorization, admin, async (req, res) => {
  try {
    let page = Number(req.query.page ? req.query.page : 1);
    let perPage = Number(req.query.perPage ? req.query.perPage : 10);
    let skipRecords = perPage * (page - 1);

    const orders = await Order.find()
      .sort({ _id: -1 })
      .skip(skipRecords)
      .limit(perPage);

    let total = await Order.countDocuments();
    return res.json({ total, orders });
    //console.log(orders.length)

    //return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json('Internal Server Error');
  }
});

//get order status----->Filter
router.get('/:status', async (req, res) => {
  const status = req.params.status;
  console.log(status);
  let orders = await Order.find({ status: { $eq: status } });
  return res.json(orders);
});

//admin get single order
router.get('/find/:id', authorization, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );
    if (!order) {
      return res.status(404).json('No Order Found Against this id');
    }
    return res.status(200).json(order);
  } catch (err) {
    return res.status(500).json(err);
  }
});







//get all orders count
router.get('/get/countorders', authorization, admin, async (req, res) => {
  try {
    var count = 0;
    const total = await Order.find();
    count = total.length;

    return res.status(200).json(count);
  } catch (err) {
    return res.status(500).json('Internal Server Error');
  }
});
//Get Pending Orders Counts
router.get('/get/pendingorders', async (req, res) => {
  try {
    const orders = await Order.find();
    const order1 = orders.filter((order) => order.status === 'Pending');
    const pending = order1.length;
    //console.log(orders.length)

    return res.status(200).json(pending);
  } catch (err) {
    return res.status(500).json('Internal Server Error');
  }
});

//Get Processing Orders Counts
router.get('/get/processingorders', async (req, res) => {
  try {
    const orders = await Order.find();
    const order1 = orders.filter((order) => order.status === 'Processing');
    const processing = order1.length;
    //console.log(orders.length)

    return res.status(200).json(processing);
  } catch (err) {
    return res.status(500).json('Internal Server Error');
  }
});

//Get Delievered Orders Counts
router.get('/get/delieveredorders', async (req, res) => {
  try {
    const orders = await Order.find();
    const order1 = orders.filter((order) => order.status === 'Delivered');
    const delievered = order1.length;
    //console.log(orders.length)

    return res.status(200).json(delievered);
  } catch (err) {
    return res.status(500).json('Internal Server Error');
  }
});


//Get Cancelled Orders Counts
router.get('/get/cancelledorders', async (req, res) => {
  try {
    const orders = await Order.find();
    const order1 = orders.filter((order) => order.status === 'Cancelled');
    const cancel = order1.length;
    //console.log(orders.length)

    return res.status(200).json(cancel);
  } catch (err) {
    return res.status(500).json('Internal Server Error');
  }
});







//Get total revenue
router.get('/get/totalrevenue', authorization, admin, async (req, res) => {
  try {
    var total = 0;
    const totalprice = await Order.find();

    totalprice.forEach((order) => {
      total += order.amount;
    });

    return res.status(200).json(total);
  } catch (err) {
    return res.status(500).json('Internal Server Error');
  }
});

//Send order id to email
router.post('/sendemail/:id', authorization, admin,async (req, res) => {

  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );



  if (!order) {
    return res.status(404).json('No Order Found Against this id');
  }


  
  // const email = order.user.email;
  // const subject = 'Order Placed Successfully';
  // const text = `Your Order has been Placed Successfully. Your Order Id is ${order._id}`;
  // const mailOptions = {
  //   from:

  const message = `
    <h4>Hi,</h4>
    <p>Thank You For Shopping In Multiverse of Computers.We have Recieved You Order. Your Order Tracking Id is ${order._id}</p>
    

  `;
  try {
    await sendEmail({
      to: order.user.email,
      subject: `Order Placed Successfully`,
      text: message,
    });
    res.status(200).json({
      message: `Email has been sent to ${order.user.email} successfully`,
    });
  } catch (error) {
    return res.status(500).json(' Email Could Not be  Send');
  }
});



 //search order by id
// router.get('/search/:id', async (req, res) => {
//   const id = req.params.id;
//   const order = await Order.findById(id);
//   if (!order) {
//     return res.status(404).json('No Order Found Against this id');
//   }
//   return res.status(200).json(order);
// }
// );


 //search product on bais of id 
// router.get('/searchorder/:id', async (req, res) => {
//   let id = req.params.id;
//   let products = await Order.find({
//     $or: [{ _id: { $regex: id, $options: 'i' } }],
//   });
//   return res.json(products);
// }
// );






module.exports = router;



