const User = require('../../models/userModel');
const validateUser = require('../../utils/validateUser');

const register = async (req, res) => {
  try {
    // validate request body
    const { name, phone, email, password } = req.body;
    const validationError = validateUser(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    //check if user already exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // create a new user
    let newUser = await User.create({ name, phone, email, password });
    if (newUser) {
      return res
        .status(201)
        .json({ message: 'User created successfully', data: newUser });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = register;
