const User = require('../models/userModel');
const { userSchema } = require('../utils/validate');

// get user with pagination
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .skip(skip)
      .limit(limit);
    
    const totalUsers = await User.countDocuments({});
    
    res.status(200).json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a single user
const createUser = async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { name, email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const newUser = new User({ name, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create multiple users in bulk
const createBulkUsers = async (req, res) => {
  try {
    const usersData = req.body.users || req.body;
    
    if (!Array.isArray(usersData)) {
      return res.status(400).json({ message: 'Users data must be an array' });
    }

    if (usersData.length === 0) {
      return res.status(400).json({ message: 'Users array cannot be empty' });
    }

    if (usersData.length > 10000) {
      return res.status(400).json({ message: 'Maximum 10,000 users allowed per request' });
    }

    // Validate each user
    const validationErrors = [];
    const validUsers = [];
    
    for (let i = 0; i < usersData.length; i++) {
      const { error } = userSchema.validate(usersData[i]);
      if (error) {
        validationErrors.push({ index: i, error: error.details[0].message });
        continue;
      }
      validUsers.push(usersData[i]);
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation errors found', 
        errors: validationErrors 
      });
    }

    // Check for duplicate emails
    const emails = validUsers.map(user => user.email);
    const existingUsers = await User.find({ email: { $in: emails } });
    const existingEmails = existingUsers.map(user => user.email);
    
    const duplicateEmails = validUsers
      .filter(user => existingEmails.includes(user.email))
      .map(user => user.email);

    if (duplicateEmails.length > 0) {
      return res.status(400).json({ 
        message: 'Duplicate emails found', 
        duplicates: duplicateEmails 
      });
    }

    // Create users in bulk using insertMany for better performance
    const createdUsers = await User.insertMany(validUsers, { ordered: false });
    
    res.status(201).json({ 
      message: 'Users created successfully', 
      count: createdUsers.length,
      users: createdUsers 
    });

  } catch (err) {
    console.error('Bulk create error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Seed 5000 users (for development/testing)
const seedUsers = async (req, res) => {
  try {
    const count = req.body.count || 5000;
    
    // Generate fake users
    const usersData = [];
    const names = [
      'John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Amanda', 'James', 'Lisa',
      'Robert', 'Jennifer', 'Michael', 'Mary', 'William', 'Patricia', 'Richard', 'Linda',
      'Joseph', 'Barbara', 'Thomas', 'Elizabeth', 'Charles', 'Susan', 'Christopher', 'Jessica',
      'Daniel', 'Sarah', 'Matthew', 'Karen', 'Anthony', 'Nancy', 'Mark', 'Betty', 'Donald',
      'Dorothy', 'Steven', 'Helen', 'Paul', 'Sandra', 'Andrew', 'Ashley', 'Joshua', 'Donna',
      'Kenneth', 'Carol', 'Kevin', 'Ruth', 'Brian', 'Sharon', 'George', 'Michelle', 'Edward',
      'Laura', 'Ronald', 'Sarah', 'Timothy', 'Kimberly', 'Jason', 'Deborah', 'Jeffrey', 'Cynthia'
    ];

    const domains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com',
      'protonmail.com', 'zoho.com', 'mail.com', 'inbox.com', 'example.com', 'test.com'
    ];

    // Generate unique emails
    const existingEmails = await User.find({}, { email: 1 }).lean();
    const usedEmails = new Set(existingEmails.map(u => u.email));

    for (let i = 0; i < count; i++) {
      let email;
      let attempt = 0;
      
      do {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomDomain = domains[Math.floor(Math.random() * domains.length)];
        const randomNumber = Math.floor(Math.random() * 10000);
        email = `${randomName.toLowerCase()}${randomNumber}@${randomDomain}`;
        attempt++;
      } while (usedEmails.has(email) && attempt < 10);

      if (usedEmails.has(email)) {
        // Fallback email
        email = `user${Date.now() + i}@example.com`;
      }

      usedEmails.add(email);

      usersData.push({
        name: `${names[Math.floor(Math.random() * names.length)]} ${names[Math.floor(Math.random() * names.length)]}`,
        email: email
      });
    }

    // Create users in bulk
    const createdUsers = await User.insertMany(usersData, { ordered: false });
    
    res.status(201).json({ 
      message: 'Users seeded successfully', 
      count: createdUsers.length,
      sample: createdUsers.slice(0, 5) // Return first 5 users as sample
    });

  } catch (err) {
    console.error('Seed users error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a user by ID
const updateUser = async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { name, email } = req.body;
    const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    console.log("req.params", req.params);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { 
  getUsers, 
  getUserById, 
  createUser, 
  createBulkUsers,
  seedUsers,
  updateUser, 
  deleteUser 
};