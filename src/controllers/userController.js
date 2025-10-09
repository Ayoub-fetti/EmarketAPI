const User = require ('../models/User');

// recuperer tous les users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

// recuperer un user avec id

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }
    res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
        }
    };
const createUser = async (req, res) => {
    try {
        const {fullName, email, password, role} = req.body;
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({error: 'Email not available'});
        }
        const user = new User({ fullName, email, password, role});
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

// delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found'});
        }
        res.json({message: 'User Delete Successfully'});
    } catch (e) {
        res.status(500).json({ error: e.message});
    }
};

module.exports = {getAllUsers, getUserById, createUser, deleteUser};
