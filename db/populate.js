require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

const CREATE_TABLE_SQL = `

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_member BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_message'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT unique_message UNIQUE (title, user_id);
    END IF;
END $$;
`;

async function main() {
    const client = new Client ({
        connectionString: process.env.DATABASE_CONNECTION_URL,
        
    });

    await client.connect();
    console.log("Connected. Populating database...");

    const johnPass = await bcrypt.hash("pass123", 10);
    const janePass = await bcrypt.hash("admin123", 10);

    await client.query(CREATE_TABLE_SQL);

    const johnResult = await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, is_member, is_admin)
        VALUES ('John', 'Milly', 'john.Milly@example.com', $1, TRUE, FALSE)
        ON CONFLICT (email) DO NOTHING
        RETURNING id`, [johnPass]
    );

    let johnId;
    if (johnResult.rows.length > 0) {
        johnId = johnResult.rows[0].id;
    } else {
        const existing = await client.query(
            `SELECT id FROM users WHERE email = 'john.Milly@example.com'`
        );
        johnId = existing.rows[0].id;
    }

    const janeResult = await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, is_member, is_admin)
        VALUES ('Jane', 'Smith', 'jane.smith@example.com', $1, TRUE, TRUE)
        ON CONFLICT (email) DO NOTHING
        RETURNING id`, [janePass]
    );

    let janeId;
    if (janeResult.rows.length > 0) {
        janeId = janeResult.rows[0].id;
    } else {
        const existing = await client.query(
            `SELECT id FROM users WHERE email = 'jane.smith@example.com'`
        );
        janeId = existing.rows[0].id;
    }

    await client.query(`
        INSERT INTO messages (title, body, user_id)
        VALUES
        ('Welcome Message', 'Hello, glad to be part of this amazing community!', $1),
        ('Admin Announcement', 'This is an important update from the team.', $2)
        ON CONFLICT (title, user_id) DO NOTHING`, [johnId, janeId]
    );

    console.log("Database populated successfully.");
    await client.end();
}

main().catch((err) => {
  console.error("Error populating database:", err);
  process.exit(1);
});