const express=require("express");
const { registerUser, loginUser ,toggleSuspend} = require("../handlers/auth-handler");
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const User=require('../db/user');
const router=express.Router();
const mongoose = require('mongoose');
const {verifyToken,isAdmin}=require("../middleware/auth-middleware")
const bodyParser = require('body-parser');
const cors=require("cors");
const app = express();


app.use(bodyParser.json());
app.use(cors());
app.use(express.json());


router.get('/allusers', verifyToken, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const pageSize = parseInt(req.query.pageSize) || 10; 
        const search = req.query.search || '';
        const isAdmin = req.query.isAdmin; 
        const isSuspended = req.query.isSuspended; 
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } }, 
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (isAdmin !== undefined) {
            query.isAdmin = isAdmin === 'true';
        }
        if (isSuspended !== undefined) {
            query.isSuspended = isSuspended === 'true';
        }
        const skip = (page - 1) * pageSize;
        const users = await User.find(query, '-password') 
            .skip(skip)
            .limit(pageSize)
            .exec();
        const totalUsers = await User.countDocuments(query);
        if (!users.length) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json({
            data: users,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / pageSize),
            totalCount: totalUsers
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            message: 'Error occurred while fetching users', 
            error: error.message 
        });
    }
});

router.post('/reset-password',async(req,res)=>{
    const { email,password } = req.body;
    console.log('request body:',req.body)
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and newpassword are required' });
      }
      try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser=await User.findOneAndUpdate(
            {email:email},
    {password:hashedPassword},
{new:true});
        if(!updatedUser){
            return res.status(404).json({message:"user not found"});
        }
        res.status(200).json({message:"password updated successfully"});

      }
      catch (error){
        console.error(error);
        res.status(500).json({message:"Server Error"});
    }

})

router.post('/forgot-password', async(req, res) => {
    const { email } = req.body;
    if (!email ) {
        return res.status(400).json({ error: 'Email is required' });
      }
    try{
        const resetLink = "http://localhost:4200/reset-password";
        const transporter=nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            service:'gmail',
            auth:{
                user:'yashwanth9182444@gmail.com',
                pass:'wolc bgvg emqr rxns'
            }
        });
        const mailOptions={
            from:'yashwanth9182444@gmail.com',
            to:email,
            subject:'Reset Link for Password',
            html:`
            <h2>Hi ${email} Welcome to Ecothread Exchange Clothing For Sustainable Tommorrow </h2>
            <p>Please click the below link to reset your password:</p>
            <b><a href="${resetLink}">Reset Password</a></b>
            `
        };
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.error(error);
                return res.status(500).json({message:'Error sending email'});
            }
            console.log('Email sent:'+info.response);
            res.status(201).json({
                message:'Please check your email for reset link'
            });
        });
    }catch (error){
        console.error(error);
        res.status(500).json({message:"Server Error"});
    }
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const activationLink = "http://localhost:4200/login";
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            service: 'gmail',
            auth: {
                user: 'yashwanth9182444@gmail.com',
                pass: 'wolc bgvg emqr rxns',
            },
        });

        const mailOptions = {
            from: 'yashwanth9182444@gmail.com',
            to: email,
            subject: 'Activate Your Ecothread Exchange-clothing Account',
            html: `
                <h2>Hi ${name}, Welcome to Ecothread Exchange Clothing For Sustainable Tomorrow</h2>
                <p>Please click the below link to activate your account:</p>
                <b><a href="${activationLink}">Activate Account</a></b>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error sending email' });
            }

            console.log('Email sent:' + info.response);

            // Send the response with success message
            res.status(201).json({
                message: 'Registration successful! Please check your email for the activation link.',
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


router.post("/login",async(req,res)=>{
    let model=req.body;
    if(model.email && model.password){
        const result=await loginUser(model);
        if(result){
            res.send(result);
        }
        else{
            res.status(400).json({
                error:"Email or Password is incorrect",   
            })
        }
    }
    else{
        res.status(400).json({
            error:"Please provide email and password",   
        })
    }
})

router.put('/users/:id/status', verifyToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isSuspended } = req.body; 
      const updatedUser = await User.findByIdAndUpdate(id, { isSuspended }, { new: true });  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      } 
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user suspension status:', error);
      res.status(500).json({ message: 'Failed to update suspension status', error: error.message });
    }
  });
  

async function connectDb(){
    await mongoose.connect("mongodb://localhost:27017",{
        dbName:"infosys"
    });
    console.log("MongoDb connected");
}
connectDb().catch((err)=>{
    console.error(err);
})



router.patch('/users/:userId/suspend',async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Toggle the suspension status
      user.isSuspended = !user.isSuspended;
      await user.save();
  
      return res.status(200).json({ message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully` });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  // Route to check if email exists
  router.post('/check-email', async (req, res) => {
    console.log("Request received:", req.body); 
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email: email });  // Find user by email
      if (user) {
        return res.json({ exists: true });  // Email found
      } else {
        return res.json({ exists: false });  // Email not found
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports=router;