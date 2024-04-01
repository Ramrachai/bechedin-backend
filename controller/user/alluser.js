const User = require('../../models/userModel');

const alluser = async (req, res) => {
  try {
    let users = await User.find();
    let count = await User.countDocuments();
    return res.status(200).json({ total: count, users: users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = alluser;
