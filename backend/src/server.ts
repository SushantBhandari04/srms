import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

// import routes
import authRoutes from "./routes/authRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"
import studentRoutes from "./routes/studentRoutes.js"
import facultyRoutes from "./routes/facultyRoutes.js"
import subjectRoutes from "./routes/subjectRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import departmentRoutes from "./routes/departmentRoutes.js"
import attendanceRoutes from "./routes/attendanceRoutes.js"
import marksRoutes from "./routes/marksRoutes.js"


dotenv.config();
export const app = express();
app.use(express.json());
app.use(cors());

(async () => {
  try {
    const connection = await pool.getConnection(); 
    console.log("✅ MySQL connected");
    connection.release();
  } catch (error) {
    console.error("❌ MySQL connection failed:", error);
  }
})();

app.get("/", (req,res)=>{
    res.send("Student record management api working!");
})

app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
});