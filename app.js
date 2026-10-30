
// task 1 completed 
import { students } from "./students.js";

function student(){
    const promise = new Promise((resolve,reject)=>{
        const object = students[3];
        setTimeout(()=>{
            if(object){
            resolve(object)
        }else{
            reject("Error fetching data")
        }
        },2000)
    })
    return promise
}

async function getStudent() {
    try {
        const result = await student();
        console.log(`${result.name} scored ${result.score}`)
    } catch (error) {
        console.log(error)
    }
    
}
getStudent();

async function getUsers() {
    try {
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/users"
        );
        if(!response.ok) throw new Error(`HTTP Error:${response.status}`)
        const users = await response.json();
         let userNames= users.map(user=>{
            return{
            name:user.name,
            email:user.email
            }
         })
         userNames.forEach(user => {
            console.log(`Name:${user.name},Email:${user.email}`)
         });
        
    } catch (error) {
        console.log("Request failed:", error);
    }
}

getUsers();