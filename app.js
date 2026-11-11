
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
        //convert student data to json
        const studentJson = JSON.stringify(result);
       // save to localstorage
       const saved = localStorage.setItem("student",studentJson)
         // retrieve student record
        const savedStudents = localStorage.getItem("student");
        //convert json to object
        const parsedStudent = JSON.parse(savedStudents);
        
        
        console.log(`${parsedStudent.name} scored ${parsedStudent.score}`)
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
            user:user.name,
            email:email.email
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