const bcrypt = require('bcryptjs');
let {validationResult} = require('express-validator')
let {v4: uuid} = require('uuid');
const users = require('../Models/user.model');
const jwt = require('jsonwebtoken');
const { use } = require('../Routes/user.router');
let siginUser = async (req, res) => {
    try {
        let errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password"
            });
        }

   
        const user = await users.findOne({ email });
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if(!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }


        const payload = {
            userId: user._id,
            type: user.type || 0,
            name: user.name
        };

        const tokenSecret = process.env.TOKEN_SECRET;
        if (!tokenSecret) {
            console.error('TOKEN_SECRET is not defined');
            return res.status(500).json({
                success: false,
                message: "Server configuration error"
            });
        }

        const token = jwt.sign(payload, tokenSecret, { expiresIn: 3600 });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                name: user.name,
                email: user.email,
                type: user.type || 0
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: "Error during login"
        });
    }
}

let signUpUser = async (req, res)=> {
    try {
        let errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { name, email, password } = req.body;

    
        let existingUser = await users.findOne({ email });
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

   
        const salt = await bcrypt.genSalt(11);
        const hashedPassword = await bcrypt.hash(password, salt);

   
        const newUser = new users({
            name,
            email,
            password: hashedPassword
        });

     
        await newUser.save();

       
        const payload = {
            userId: newUser._id,
            type: newUser.type || 0,
            name: newUser.name
        };

        const tokenSecret = process.env.TOKEN_SECRET;
        const token = jwt.sign(payload, tokenSecret, { expiresIn: 3600 });

        return res.status(201).json({
            success: true,
            message: "User signed up successfully",
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            success: false,
            message: "Error creating user"
        });
    }
}

let updateUser = (req, res)=> {
    let userId = req.params.id;
    let userIndex = -1;
    let user = users.find((u,idx)=>{
        userIndex = idx;
        return u.id == userId;
    })
    if(!userId) {
       return res.status(404).json({success:false,"message":"user not found"})
    }
    let newPhone = req.body.phone;
    let newName = req.body.name;
    let updatedUser = {...user}
    if(newName && newName != "")
    {
        updatedUser.name = newDesc
    }
    if(newPhone && newPhone != "")
    {
        updatedUser.phone = newPrice
    }
    users[userIndex] = updatedUser
    res.status(200).json({success:true,message:"User Details Updated successfully"})
}

let deleteUser = ()=>{
    let userId = req.params.id;
    users = users.filter(u=>{
        return u.id != userId
    })
    res.status(200).json({success:true,message:"User Deletd successfully"})
}

module.exports = {
    siginUser,
    signUpUser,
    updateUser,
    deleteUser
}