import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_PASS } from "./config";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import cors from "cors";
import { z } from "zod";

const app = express();
app.use(express.json());
app.use(cors());

const signupSchema = z.object({
    username : z.string().min(3, "Atleast 3 characters").max(20, "At most 20 characters").regex(/^[a-z0-9._]{3,20}$/ , "Invalid Username must contain lowercase letters (or) digits (or) . (or) _  characters only"),
    password : z.string().min(7, "Atleast 7 characters").max(20, "Atmost 20 characters")
    .regex(/[A-Z]/, "Password must contain an UpperCase letter" )
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one Special Character")
});

app.post("/api/v1/signup", async (req, res) => {
    //Hash pass and zod validation
    const username = req.body.username;
    const password = req.body.password;
    const data = {username, password}
    const result = signupSchema.safeParse(data);

    if(result.success){
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try{
            await UserModel.create({
                username : username,
                password : hashedPassword
            });
            res.json({
                message : "User Signed up"
            });
        }catch(e){
            res.status(411).json({
                message : "User exists"
            });
        }
    }else{
        res.status(400).json({
            message : result.error.format()
        })
    }
})

app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const existingUser = await UserModel.findOne({ username })
    if(existingUser){
        const hashed = existingUser.password;
        // @ts-ignore
        const existingPassword = await bcrypt.compare(password, hashed);
        if(existingPassword){
            const token = jwt.sign({
                id : existingUser._id
            }, JWT_PASS);
    
            res.json({
                token
            })
            return;
        }
    }

    res.status(403).json({
        message : "Incorrect credentials or User Doesn't exist"
    });

})

app.post("/api/v1/content", userMiddleware, async (req, res) =>{
    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link : link,
        type : type,
        title : req.body.title,
        // @ts-ignore
        userId : req.userId,
        tags : []
    })

    res.json({
        message : "Content added Successfully"
    })

})

app.get("/api/v1/content", userMiddleware, async (req, res) =>{
    // @ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId : userId
    }).populate("userId", "username")

    res.json({
        content
    })
})

app.delete("/api/v1/content/:id", userMiddleware, async (req, res) =>{
    const contentId = req.params.id;
    // @ts-ignore
    const userId = req.userId;
    
    try{
        await ContentModel.deleteOne({
            userId : userId,
            _id : contentId
        })
    }catch(e : any){
        res.status(404).json({
            message : e
        })
    }

})

app.post("/api/v1/brain/share", userMiddleware, async (req, res) =>{
    const share = req.body.share;
    // @ts-ignore
    const userId = req.userId;
    if(share){
        const existingLink = await LinkModel.findOne({
            userId
        })
        if(existingLink){
            res.json({
                hash : existingLink.hash
            })
            return;
        }

        const hash = random(10);
        await LinkModel.create({
            userId : userId,
            hash : hash
        })

        res.status(200).json({
            hash
        })

    }else{
        await LinkModel.deleteOne({
            userId : userId,
        });
        res.status(200).json({
            message : "Updated sharable link successfully"
        })
    }

})

app.get("/api/v1/brain/:shareLink", async (req, res) =>{
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    });

    if(!link){
        res.status(411).json({
            message : "Link Doesn't Exist"
        })
        return;
    };

    const content = await ContentModel.find({
        userId : link.userId
    });

    const user = await UserModel.findOne({
        _id : link.userId
    });

    res.json({
        username : user?.username,
        content : content
    });

})

app.listen(3000);