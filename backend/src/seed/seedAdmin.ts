import pool from "../config/db.js";
import bcrypt from 'bcrypt';

async function seedAdmin(){
    const name = "Super Admin";
    const email = "admin@gmail.com";
    const password = "admin123";
    const role = 'admin';

    const [existing]:any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if(existing.length>0){
        console.log("Admin already exists!");
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',[name, email, hashedPassword, role]);

    console.log("Admin created successfully!");
}

seedAdmin()
    .then(() => process.exit(0))
    .catch((err)=>{
        console.log(`Error seeding admin: ${err}`);
        process.exit(1);
    });
