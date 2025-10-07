"use server"
import { signIn } from "../auth"
export default async function loginAction(loginDetails){
        console.log("login details from form", loginDetails)
        try {

            const response = await signIn("credentials", {
                email: loginDetails.email,
                password: loginDetails.password,
                redirect:false,
            })
            if(!response || response.error){
                console.log("login failed", response?.error)
                throw new Error("login falied")
            }
                return {success:true}

        } catch (error) {
            throw new Error("Invalid Credentials")
        }
}