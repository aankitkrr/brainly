import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, unique: true, require : true},
  email : {type: String, unique: true, require : true},
  password: String,
});

export const UserModel = model("User", UserSchema);
