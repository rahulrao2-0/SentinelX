import {pool} from '../config/db.js';

export const SignupUser = async (req,res)=>{
    try{
        console.log("SignupUser function called");

        res.status(200).json({message:"SignupUser function called successfully"});

    }catch(err){

    }


}

export const LoginUser = async (req,res)=>{
    try{

    }catch(err){
        
    }
}