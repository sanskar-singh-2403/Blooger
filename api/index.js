require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({dest: "uploads/"});
const fs = require("fs");

const salt = bcrypt.genSaltSync(10);

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

mongoose.connect(process.env.DATABASE_URI)
.then(() => {
    console.log("Connected to MongoDB");
});

app.get("/", (req,res) => {
  res.json({message: "this is just for deployments"});
});

app.post("/register", async(req,res) => {
    const {username, password} = req.body;
    try {

        const isUserPresent = await User.findOne({username});
    

        if(isUserPresent) {
            return res.status(400).json({message: "User already exists"});
        } else {

            const userDoc = await User.create({
                username,
                password: bcrypt.hashSync(password, salt),
            })
            
            res.json(userDoc);
        }
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

app.post("/login", async (req,res) => {

    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    console.log(userDoc);

    const matchedPass = bcrypt.compareSync(password, userDoc.password);

    if (matchedPass) {
        jwt.sign({username, id: userDoc._id}, process.env.JWT_SECRET, (err, token) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.cookie("token", token).json({
                    id: userDoc._id,
                    username,
                });
            }
        }); 
    } else {
        res.status(400).json({message: "Invalid credentials"});
    }


});

app.get("/profile", (req,res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, info) => {
            if (err) throw err;
    
            res.json(info);
        });
    }
})

app.post("/logout", (req,res) => {
    res.cookie("token", '').json({message: "Logged out"});
});

app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  
    const {token} = req.cookies;
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err,info) => {
      if (err) throw err;
      const {title,summary,content} = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover:newPath,
        author:info.id,
      });
      res.json(postDoc);
    });
  
  });

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
    let newPath = null;
    if (req.file) {
        const {originalname,path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path+'.'+ext;
        fs.renameSync(path, newPath);
    }
  
    const {token} = req.cookies;
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err,info) => {
      if (err) throw err;
      const {id,title,summary,content} = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json('you are not the author');
      }
      await postDoc.updateOne({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });
  
      res.json(postDoc);
    });
  
    });
  
  app.get('/post', async (req,res) => {
    res.json(
      await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1})
        .limit(20)
        // TODO: implement design of paginaiton
    );
  });
  
  app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  })

app.listen(4000, () => { console.log("Server is running in port 4000") });
