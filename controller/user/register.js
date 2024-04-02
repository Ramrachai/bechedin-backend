const User = require('../../models/userModel');
const validateUser = require('../../utils/validateUser');

const register = async (req, res) => {
  try {
    // validate request body
    const { name, phone, email, password } = req.body;

    const validationError = validateUser(req.body);

    console.log('validation error = ', validationError);
    if (validationError) {
      return res
        .status(400)
        .json({ status: 'error', message: validationError });
    }

    //check if user already exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      console.log('user already exist');
      return res
        .status(400)
        .json({ status: 'failed', message: 'User already exists' });
    }
    // create a new user
    let newUser = await User.create({ name, phone, email, password });
    if (newUser) {
      console.log('user created');
      return res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: newUser,
      });
    } else {
      throw new Error('Unable to save user in Database');
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = register;
