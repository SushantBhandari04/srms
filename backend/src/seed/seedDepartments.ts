import pool from "../config/db.js";

const departments = [
    { dept_code: "CSE", dept_name: "Computer Science and Engineering" },
    { dept_code: "ECE", dept_name: "Electronics and Communication Engineering" },
    { dept_code: "EEE", dept_name: "Electrical and Electronics Engineering" },
    { dept_code: "MECH", dept_name: "Mechanical Engineering" },
    { dept_code: "CIVIL", dept_name: "Civil Engineering" },
    { dept_code: "IT", dept_name: "Information Technology" },
    { dept_code: "CHEM", dept_name: "Chemical Engineering" }
];

async function seedDepartments() {
    const connection = await pool.getConnection();
    
    try {
        console.log("Starting department seeding...");

        for (const dept of departments) {
            // Check if department already exists
            const [existing]: any = await connection.query(
                'SELECT * FROM departments WHERE dept_code = ?',
                [dept.dept_code]
            );

            if (existing.length > 0) {
                console.log(`Department ${dept.dept_code} already exists, skipping...`);
                continue;
            }

            // Insert department
            await connection.query(
                'INSERT INTO departments (dept_code, dept_name) VALUES (?, ?)',
                [dept.dept_code, dept.dept_name]
            );
            console.log(`✓ Created department: ${dept.dept_name} (${dept.dept_code})`);
        }

        console.log("\n✅ Department seeding completed successfully!");
    } catch (error: any) {
        console.error("❌ Error seeding departments:", error.message);
        throw error;
    } finally {
        connection.release();
    }
}

seedDepartments()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(`Error: ${err}`);
        process.exit(1);
    });
