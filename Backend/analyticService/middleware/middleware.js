require('dotenv').config();
const AUTHSERVICEURL = `${process.env.AUTHSERVICEURL}`;
const axios = require('axios')

// hit the auth service and check if token is valid or not
const getUserId = async (req,res,next) => {
    try{
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; 

        const response =  await axios.post(AUTHSERVICEURL,{},{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        if(response.status == 200){
            req.userId = response.data.data.user.userId
            next()
        }else {
           return res.status(401).json({data:{message:'Token is not valid'}})
        }
      
    }  catch(err){
        console.log('unable to hit auth service',err)
        return res.status(401).json({data:{message:'Unable to hit the auth service'}})
    } 
}

module.exports = {getUserId}