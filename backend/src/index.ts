import app from "./app";
import { database } from "./db/database";
import "dotenv/config"

const PORT = process.env.PORT || 5000;

database()
.then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Server is running on port http://localhost:${PORT}`)
    })
}).catch((err)=>{
    console.log("Connection failed to database", err)
})