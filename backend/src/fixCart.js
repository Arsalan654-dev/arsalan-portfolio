require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = mongoose.model('users', new mongoose.Schema({
    name: String,
    email: String,
    cart: [{
      item: { type: mongoose.Schema.Types.ObjectId },
      itemType: String,
      quantity: Number
    }]
  }, { strict: false }));

  const Project = mongoose.model('projects', new mongoose.Schema({
    title: String
  }, { strict: false }));

  const Service = mongoose.model('services', new mongoose.Schema({
    title: String
  }, { strict: false }));

  const users = await User.find({});
  let cleaned = 0;

  for (const user of users) {
    const originalLength = user.cart.length;
    const validItems = [];

    for (const ci of user.cart) {
      const Model = ci.itemType === 'projects' ? Project : Service;
      const exists = await Model.findById(ci.item).select('_id');
      if (exists) {
        validItems.push(ci);
      }
    }

    if (validItems.length !== originalLength) {
      user.cart = validItems;
      await user.save();
      cleaned += (originalLength - validItems.length);
      console.log(`Cleaned ${originalLength - validItems.length} stale items for ${user.email}`);
    }
  }

  console.log(`Total cleaned: ${cleaned} stale cart items`);
  process.exit(0);
})();
