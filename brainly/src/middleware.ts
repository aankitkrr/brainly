import { NextFunction, Request, Response } from "express";
import { JWT_PASS } from "./config";
import jwt, { JwtPayload } from "jsonwebtoken";


export const userMiddleware = (req : Request, res : Response, 
    next : NextFunction) =>{
        const header = req.headers["authorization"];
        const decoded = jwt.verify(header as string, JWT_PASS);
        if(decoded){
            // @ts-ignore
            req.userId = decoded.id;
            // @ts-ignore
            next();
        }else{
            res.status(403).json({
                message : "Please log in first"
            })
        }
}
