import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utitlity-class.js";
import { TryCatch } from "../middlewares/error.js";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
      const { _id, name, email, photo, gender, dob } = req.body;
  
      const user = await User.create({
        _id,
        name,
        email,
        photo,
        gender,
        dob,
      });
  
      return res.status(201).json({
          success: true,
          message: `Welcome, ${user.name}`,
        });
  }
);

