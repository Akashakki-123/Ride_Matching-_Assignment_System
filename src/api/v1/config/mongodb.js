import {connect} from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const username =process.env.DBUSERNAME
const password = process.env.DBPASSWORD
const dataBaseName = process.env.DBNAME
const databaseLink =process.env.DBLINK



const connection = `mongodb+srv://${username}:${password}@${databaseLink}/${dataBaseName}?retryWrites=true&w=majority`


export const db = () => {
    connect(connection)
  .then(() => console.log("Datebase Connected"))
  .catch((err) => console.log(err.message))


}