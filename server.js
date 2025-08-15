// const express = require("express")
// const mongoose = require("mongoose")
// const cors = require("cors")
// const dotenv = require("dotenv")
// const User = require("./model/user")
// const jwt = require("jsonwebtoken")
// const bcrypt = require('bcryptjs')
// const nodemailer = require("nodemailer");


// const app = express()
// dotenv.config()

// // Middleware
// app.use(express.json())
// app.use(cors()) 





// //  Connect MongoDB
// async function connection() {
//     try {
//         const connect = await mongoose.connect(process.env.MONGODB_URI,{
//             useNewUrlParser:true,
//             useUnifiedTopology:true
//         })
//             console.log("MongoDB Connected",connect.connection.host)
//     } catch (error) {
//         console.error(error.message,"MongoDB Connection Failed")
//     }
    
// }
// connection()


// // Auth Middleware

// function auth(req, res, next) {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ message: "No Token Provided", status: 401 });
//         }

//         const token = authHeader.split(" ")[1];
//         const result = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = result;
//         next(error);
//     } catch (error) {
//         console.error("Token verification failed:", error.message);
//         res.send({message:"Invalid Token",status:400})
//         return
//     }
// }


// // Nodemailer setup

// async function sendOTP(email, otp) {
//     try{
//     const transporter = nodemailer.createTransport({
//         service:"gmail",
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass:process.env.EMAIL_PASS,
//         },
//     });

//     const mailOptions = {
//         from:`"Auth System" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject: "Your OTP Code",
//         text: `Your OTP code is ${otp}. It Will expire in 5 minutes.`,
//     }

//     await transporter.sendMail(mailOptions);
//     console.log(` OTP sent to ${email}`)
// } catch(error){
//         console.error("Failed to send OTP:", error)
//        throw error;
// }
// }


// //Register Route

// app.post("/register",async(req,res,next)=>{
//     try {
//         // Old User
//      const {email,password} = req.body     
//      const existUser = await User.findOne({email:email})
//      if(existUser){
//         res.send({message:"Already Registered",status:409})
//         return;
//      }else{
//         // New User
//         const hashedPassword =  await bcrypt.hash(password,10)
//          const newUser = new User ({...req.body,password: hashedPassword})
//          const savedData = await newUser.save()
//          let token = jwt.sign({id:savedData._id},process.env.JWT_SECRET,{expiresIn:"1h"})
//          res.send({message:"Registered Successfully",status:200,data:savedData,token:token})

//      }

//     } catch (error) {
//         next(error)
//     }
// })

// // Login Route

// app.post("/login",async(req,res,next)=>{
//      const {email,password} = req.body
//     try {
//             const user = await User.findOne({email:email})
//         if (!user){
//            return res.send({message:"User Not Found",status:400})
            
//         }
//             const match = await bcrypt.compare(password,user.password);
//             if(!match){
              
//                 res.send({message:"Invalid Password",status:400})
//                 return 
//             }

//             const token = jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:"1h"})

//             res.send({message:"Login Success",status:200,token:token, user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//             }})


//     } catch (error) {
//         res.send({message:"Login Failed", status:500, error:error.message})
//         next(error)
//     }
// })

// //SEND OTP

// app.post("/sendotp", async (req, res) => {
  
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email: email });

//     if (!user) {
//       return res.send({ message: "Email Not Found", status: 400 });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     user.otp = otp;
//     user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

//     await user.save();
//     await sendOTP(email, otp); // This should also NOT send a response

//     res.send({ message: "OTP sent to email", status: 200 });
//     return 
//   } catch (error) {
//     console.error("OTP error:", error);
//     res.status(500).send({ message: "Error sending OTP", error: error.message });
//     return 
//   }
// });

// //RESET-PASSWORD

// app.post("/reset",async(req,res,next)=>{
   
//      const {email, otp, newPassword} = req.body  
//     try {

//         const user = await User.findOne({email:email})
//         if(!user || user.otp !== otp || new Date() > user.otpExpiry){
//             res.send({message:"Invalid or Expired OTP",status:400})
//             return;
//         }

        

//         const hashed = await bcrypt.hash(newPassword,10);
//         user.password = hashed;
//         user.otp = null;
//         user.otpExpires = null;

//         await user.save()

//               console.log("Password reset successful for:", email);

//         res.send({message:"Password rest Successful",status:200})
        
//     } catch (error) {
//         res.send({message:"Error resetting Password",status:500})
//         next(error)
//     }
// })

// // ❗ Corrected Error Handler
// app.use((err,req,res,next)=>{
//    res.status(500).send({status:500,error:err?.message || "server error"})
// })
// //  Start Server
// app.listen(3005,()=>console.log("server 3005 is running"))


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const User = require("./model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());

// Connect MongoDB
async function connection() {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected", connect.connection.host);
  } catch (error) {
    console.error(error.message, "MongoDB Connection Failed");
  }
}
connection();

// Auth Middleware
function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No Token Provided", status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const result = jwt.verify(token, process.env.JWT_SECRET);
    req.user = result;
    next(); 
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.send({ message: "Invalid Token", status: 400 });
  }
}

// Nodemailer setup
async function sendOTP(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Auth System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Failed to send OTP:", error);
    throw error;
  }
}

// Register Route
app.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.send({ message: "Already Registered", status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    const savedData = await newUser.save();
    const token = jwt.sign({ id: savedData._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.send({ message: "Registered Successfully", status: 200, data: savedData, token });
  } catch (error) {
    next(error);
  }
});

// Login Route
app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send({ message: "User Not Found", status: 400 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.send({ message: "Invalid Password", status: 400 });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.send({
      message: "Login Success",
      status: 200,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.send({ message: "Login Failed", status: 500, error: error.message });
    next(error);
  }
});

// Send OTP
app.post("/sendotp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.send({ message: "Email Not Found", status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await user.save();
    await sendOTP(email, otp);

    res.send({ message: "OTP sent to email", status: 200 });
  } catch (error) {
    console.error("OTP error:", error);
    res.status(500).send({ message: "Error sending OTP", error: error.message });
  }
});

// Reset Password
app.post("/reset", async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });

    // ✅ Fixed field name: otpExpires
    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
      return res.send({ message: "Invalid or Expired OTP", status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = null;
    user.otpExpires = null;

    await user.save();
    console.log("Password reset successful for:", email);

    res.send({ message: "Password reset successful", status: 200 });
  } catch (error) {
    res.send({ message: "Error resetting password", status: 500 });
    next(error);
  }
});

// Error Handler
app.use((err, req, res, next) => {
  res.status(500).send({ status: 500, error: err?.message || "Server error" });
});

// Start Server
app.listen(3005, () => console.log("Server 3005 is running"));