import { db } from "../../database/db.js";
import { users } from "../../database/schema.js";

export const isLoggedIn = (req, res, next) => {
    //console.log(req)
    if (req?.isAuthenticated()) return next()
    return res.status(401).json({error: "User not logged in!"})
}