
require("dotenv").config();

const jwt = require("jsonwebtoken");
require("dotenv").config();

const cors = require("cors");
const express = require("express");
const bcrypt = require("bcrypt");
const db = require("./db");

// Create the Express app FIRST
const app = express();

// Middleware AFTER creating app
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;


// Test route
app.get("/", (req, res) => {
    res.send("CampusFind Backend is Running!");
});



// ===============================
// JWT AUTHENTICATION MIDDLEWARE
// ===============================
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
        return res.status(401).json({
            message: "Authentication required. Please log in."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            user_id: decoded.user_id,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token. Please log in again."
        });
    }
}


// REGISTER API
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        console.log("Registration phone received:", phone);

        // Check required fields
        if (!name || !email || !phone || !password || !role) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        // Validate phone number
if (!/^[0-9]{10}$/.test(String(phone || "").trim())) {
    return res.status(400).json({
        message: "Please enter a valid 10-digit phone number."
    });
}

        // Validate role
        if (!["student", "faculty"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role selected."
            });
        }

        // Check password length
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long."
            });
        }

        // Check whether email already exists
        db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email.trim().toLowerCase()],
            async (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        message: "Database error."
                    });
                }

                if (results.length > 0) {
                    return res.status(409).json({
                        message: "An account with this email already exists."
                    });
                }

                try {
                    // Hash the password
                    const hashedPassword = await bcrypt.hash(password, 10);

                    // Save new user with phone number
db.query(
    `INSERT INTO users (name, email, phone, password, role)
     VALUES (?, ?, ?, ?, ?)`,
    [
        name.trim(),
        email.trim().toLowerCase(),
        String(phone).trim(),
        hashedPassword,
        role
    ],
                    
                        (insertErr) => {
                            if (insertErr) {
                                console.error(insertErr);
                                return res.status(500).json({
                                    message: "Could not create your account."
                                });
                            }

                            return res.status(201).json({
                                message: "Registration successful! You can now log in."
                            });
                        }
                    );
                } catch (hashErr) {
                    console.error(hashErr);
                    return res.status(500).json({
                        message: "Could not process your password."
                    });
                }
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong."
        });
    }
});

// REPORT LOST OR FOUND ITEM
app.post("/api/items", async (req, res) => {
try {
const {
user_id,
item_type,
item_name,
category,
description,
location,
item_date
} = req.body;


    if (
        !user_id ||
        !item_type ||
        !item_name ||
        !category ||
        !description ||
        !location ||
        !item_date
    ) {
        return res.status(400).json({
            message: "Please fill in all required fields."
        });
    }

    if (!["lost", "found"].includes(item_type)) {
        return res.status(400).json({
            message: "Item type must be lost or found."
        });
    }

    const sql = `
        INSERT INTO items
        (user_id, item_type, item_name, category, description, location, item_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            item_type,
            item_name,
            category,
            description,
            location,
            item_date
        ],
        (err, result) => {
            if (err) {
                console.error("Item report error:", err.message);

                return res.status(500).json({
                    message: "Could not save the item report."
                });
            }

            return res.status(201).json({
                message: "Item report submitted successfully!",
                item_id: result.insertId
            });
        }
    );
} catch (error) {
    console.error("Report API error:", error.message);

    res.status(500).json({
        message: "Something went wrong while submitting the report."
    });
}


});

// GET ALL REPORTED ITEMS
app.get("/api/items", (req, res) => {
const sql = `         SELECT
            item_id,
            user_id,
            item_type,
            item_name,
            category,
            description,
            location,
            item_date,
            status,
            created_at
        FROM items
        ORDER BY created_at DESC
    `;


db.query(sql, (err, results) => {
    if (err) {
        console.error("Fetch items error:", err.message);

        return res.status(500).json({
            message: "Could not retrieve items."
        });
    }

    res.json(results);
});


});







// LOGIN API
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password."
            });
        }

        // Find user in database
        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, results) => {
                if (err) {
                    console.error("Login database error:", err);
                    return res.status(500).json({
                        message: "Database error."
                    });
                }

                if (results.length === 0) {
                    return res.status(401).json({
                        message: "Invalid email or password."
                    });
                }

                const user = results[0];

                // Compare entered password with stored hash
                const passwordMatch = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!passwordMatch) {
                    return res.status(401).json({
                        message: "Invalid email or password."
                    });
                }

                // Generate a signed JWT
const token = jwt.sign(
    {
        user_id: user.user_id,
        role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
);

// Login successful
return res.status(200).json({
    message: "Login successful!",
    token,
    user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
    }
});
            }
        );

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Something went wrong."
        });
    }
});



// ===============================
// CLAIM SYSTEM APIs
// ===============================

// SUBMIT A CLAIM
app.post("/api/claims", (req, res) => {
    const { item_id, user_id, claim_description } = req.body;

    if (!item_id || !user_id || !claim_description?.trim()) {
        return res.status(400).json({
            message: "Item, user, and claim description are required."
        });
    }

   
db.query(
    `SELECT item_id, user_id, status, item_type
     FROM items
     WHERE item_id = ?`,
    [item_id],
    (err, items) => {
        if (err) {
            console.error("Claim item lookup error:", err);
            return res.status(500).json({
                message: "Could not verify the item."
            });
        }

        if (items.length === 0) {
            return res.status(404).json({
                message: "Item not found."
            });
        }

        const item = items[0];

        // Prevent users from claiming their own reported items.
        if (Number(item.user_id) === Number(user_id)) {
            return res.status(400).json({
                message: "You cannot claim your own reported item."
            });
        }

        // Only active items can be claimed.
        if (String(item.status).toUpperCase() !== "ACTIVE") {
            return res.status(400).json({
                message: "This item is no longer available for claims."
            });
        }

        // Prevent duplicate pending or approved claims.
        db.query(
            `SELECT claim_id
             FROM claims
             WHERE item_id = ? AND user_id = ?
               AND status IN ('PENDING', 'APPROVED')`,
            [item_id, user_id],
            (checkErr, existing) => {
                if (checkErr) {
                    console.error("Duplicate claim check error:", checkErr);
                    return res.status(500).json({
                        message: "Could not check existing claims."
                    });
                }

                if (existing.length > 0) {
                    return res.status(409).json({
                        message: "You already have an active claim for this item."
                    });
                }

                db.query(
                    `INSERT INTO claims
                     (item_id, user_id, claim_description, status)
                     VALUES (?, ?, ?, 'PENDING')`,
                    [item_id, user_id, claim_description.trim()],
                    (insertErr, result) => {
                        if (insertErr) {
                            console.error("Claim submission error:", insertErr);
                            return res.status(500).json({
                                message: "Could not submit your claim."
                            });
                        }

                        return res.status(201).json({
                            message: "Claim submitted successfully!",
                            claim_id: result.insertId
                        });
                    }
                );
            }
        );
    }
);
});







// VIEW CLAIMS SUBMITTED BY A USER
app.get("/api/claims/my/:userId", (req, res) => {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID." });
    }

    const sql = `
        SELECT
            c.claim_id,
            c.item_id,
            c.claim_description,
            c.status AS claim_status,
            c.created_at,
            i.item_name,
            i.location,
            i.item_type,
            i.status AS item_status,
            finder.name AS finder_name,
            finder.email AS finder_email
        FROM claims c
        JOIN items i ON c.item_id = i.item_id
        JOIN users finder ON i.user_id = finder.user_id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("My claims error:", err);
            return res.status(500).json({
                message: "Could not retrieve your claims."
            });
        }

        res.json(results);
    });
});


// VIEW CLAIMS RECEIVED BY AN ITEM REPORTER
app.get("/api/claims/received/:userId", (req, res) => {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID." });
    }

    const sql = `
        SELECT
            c.claim_id,
            c.item_id,
            c.user_id AS claimant_id,
            c.claim_description,
            c.status AS claim_status,
            c.created_at,
            i.item_name,
            i.location,
            i.status AS item_status,
            claimant.name AS claimant_name,
            claimant.email AS claimant_email
        FROM claims c
        JOIN items i ON c.item_id = i.item_id
        JOIN users claimant ON c.user_id = claimant.user_id
        WHERE i.user_id = ?
          AND i.item_type = 'found'
        ORDER BY c.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Received claims error:", err);
            return res.status(500).json({
                message: "Could not retrieve received claims."
            });
        }

        res.json(results);
    });
});


// ========================================
// GET CLAIMS SUBMITTED BY LOGGED-IN USER
// ========================================
app.get("/api/claims/my", authenticateToken, (req, res) => {
    const userId = req.user.user_id;

    db.query(
        `SELECT
            c.claim_id,
            c.item_id,
            c.claim_description,
            c.status AS claim_status,
            c.reporter_confirmed,
            c.claimant_confirmed,
            c.created_at,
            i.item_name,
            i.item_type,
            i.location,
            i.status AS item_status
         FROM claims c
         JOIN items i ON c.item_id = i.item_id
         WHERE c.user_id = ?
         ORDER BY c.created_at DESC`,
        [userId],
        (err, results) => {
            if (err) {
                console.error("My claims error:", err);
                return res.status(500).json({
                    message: "Could not retrieve your claims."
                });
            }

            return res.json({ claims: results });
        }
    );
});



// ========================================
// GET CLAIMS RECEIVED BY LOGGED-IN REPORTER
// ========================================
app.get("/api/claims/received", authenticateToken, (req, res) => {
    const userId = req.user.user_id;

    db.query(
        `SELECT
            c.claim_id,
            c.item_id,
            c.user_id AS claimant_id,
            c.claim_description,
            c.status AS claim_status,
            c.reporter_confirmed,
            c.claimant_confirmed,
            c.created_at,
            i.item_name,
            i.location,
            i.status AS item_status,
            claimant.name AS claimant_name
         FROM claims c
         JOIN items i ON c.item_id = i.item_id
         JOIN users claimant ON c.user_id = claimant.user_id
         WHERE i.user_id = ?
           AND i.item_type = 'found'
         ORDER BY c.created_at DESC`,
        [userId],
        (err, results) => {
            if (err) {
                console.error("Received claims error:", err);
                return res.status(500).json({
                    message: "Could not retrieve received claims."
                });
            }

            return res.json({ claims: results });
        }
    );
});




// APPROVE OR REJECT A CLAIM
app.put("/api/claims/:claimId/status", authenticateToken, (req, res) => {
   const claimId = Number(req.params.claimId);
const user_id = req.user.user_id;
const { status } = req.body;

    if (!Number.isInteger(claimId) || claimId <= 0) {
        return res.status(400).json({ message: "Invalid claim ID." });
    }

    if (!user_id || !["APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({
            message: "Valid user ID and claim status are required."
        });
    }

    db.query(
        `SELECT c.claim_id, c.status AS claim_status,
                i.item_id, i.user_id AS finder_id,
                i.status AS item_status
         FROM claims c
         JOIN items i ON c.item_id = i.item_id
         WHERE c.claim_id = ? AND i.item_type = 'found'`,
        [claimId],
        (err, rows) => {
            if (err) {
                console.error("Claim status lookup error:", err);
                return res.status(500).json({
                    message: "Could not verify the claim."
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "Claim not found."
                });
            }

            const claim = rows[0];

            if (Number(claim.finder_id) !== Number(user_id)) {
                return res.status(403).json({
                    message: "Only the person who reported this item can review its claims."
                });
            }

            if (claim.claim_status !== "PENDING") {
                return res.status(400).json({
                    message: "This claim has already been reviewed."
                });
            }

            if (claim.item_status !== "ACTIVE") {
                return res.status(400).json({
                    message: "This item is no longer available."
                });
            }

            if (status === "REJECTED") {
                db.query(
                    `UPDATE claims SET status = 'REJECTED'
                     WHERE claim_id = ? AND status = 'PENDING'`,
                    [claimId],
                    (updateErr, result) => {
                        if (updateErr) {
                            console.error("Reject claim error:", updateErr);
                            return res.status(500).json({
                                message: "Could not reject the claim."
                            });
                        }

                        if (result.affectedRows === 0) {
                            return res.status(409).json({
                                message: "This claim has already been reviewed."
                            });
                        }

                        return res.json({
                            message: "Claim rejected successfully."
                        });
                    }
                );

                return;
            }

            // Approve only if this item is still ACTIVE.
            db.query(
                `UPDATE items SET status = 'CLAIMED'
                 WHERE item_id = ? AND status = 'ACTIVE'`,
                [claim.item_id],
                (itemErr, itemResult) => {
                    if (itemErr) {
                        console.error("Approve item update error:", itemErr);
                        return res.status(500).json({
                            message: "Could not approve the claim."
                        });
                    }

                    if (itemResult.affectedRows === 0) {
                        return res.status(409).json({
                            message: "This item has already been claimed."
                        });
                    }

                    db.query(
                        `UPDATE claims SET status = 'APPROVED'
                         WHERE claim_id = ? AND status = 'PENDING'`,
                        [claimId],
                        (claimErr, claimResult) => {
                            if (claimErr || claimResult.affectedRows === 0) {
                                console.error("Approve claim update error:", claimErr);

                                // Restore availability if claim approval failed.
                                db.query(
                                    `UPDATE items SET status = 'ACTIVE'
                                     WHERE item_id = ? AND status = 'CLAIMED'`,
                                    [claim.item_id]
                                );

                                return res.status(500).json({
                                    message: "Could not complete claim approval."
                                });
                            }

                            return res.json({
                                message: "Claim approved successfully!"
                            });
                        }
                    );
                }
            );
        }
    );
});


// ========================================
// HANDOVER CONFIRMATION API
// ========================================
app.put("/api/claims/:claimId/confirm-handover", authenticateToken, async (req, res) => {
    const claimId = req.params.claimId;
    const userId = req.user.user_id;

    let connection;

    try {
        connection = await new Promise((resolve, reject) => {
            db.getConnection((err, conn) => {
                if (err) return reject(err);
                resolve(conn);
            });
        });

        const query = (sql, params = []) =>
            new Promise((resolve, reject) => {
                connection.query(sql, params, (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

        await new Promise((resolve, reject) => {
            connection.beginTransaction(err =>
                err ? reject(err) : resolve()
            );
        });

        // Find and lock the claim and its item.
        const rows = await query(
            `SELECT
                c.claim_id,
                c.item_id,
                c.user_id AS claimant_id,
                c.status AS claim_status,
                c.reporter_confirmed,
                c.claimant_confirmed,
                i.user_id AS reporter_id,
                i.status AS item_status
             FROM claims c
             JOIN items i ON c.item_id = i.item_id
             WHERE c.claim_id = ?
             FOR UPDATE`,
            [claimId]
        );

        if (rows.length === 0) {
            await new Promise(resolve => connection.rollback(resolve));
            return res.status(404).json({ message: "Claim not found." });
        }

        const claim = rows[0];

        // Only the reporter or approved claimant may confirm.
        const isReporter = Number(userId) === Number(claim.reporter_id);
        const isClaimant = Number(userId) === Number(claim.claimant_id);

        if (!isReporter && !isClaimant) {
            await new Promise(resolve => connection.rollback(resolve));
            return res.status(403).json({
                message: "You are not authorized to confirm this handover."
            });
        }

        if (claim.claim_status !== "APPROVED") {
            await new Promise(resolve => connection.rollback(resolve));
            return res.status(400).json({
                message: "Only approved claims can be confirmed."
            });
        }

        if (claim.item_status !== "CLAIMED") {
            await new Promise(resolve => connection.rollback(resolve));
            return res.status(400).json({
                message: "This item is not currently awaiting handover."
            });
        }

        // Record the confirmation of the logged-in user.
        if (isReporter && !claim.reporter_confirmed) {
            await query(
                "UPDATE claims SET reporter_confirmed = TRUE WHERE claim_id = ?",
                [claimId]
            );
        }

        if (isClaimant && !claim.claimant_confirmed) {
            await query(
                "UPDATE claims SET claimant_confirmed = TRUE WHERE claim_id = ?",
                [claimId]
            );
        }

        // Read the latest confirmation values.
        const updatedRows = await query(
            `SELECT reporter_confirmed, claimant_confirmed
             FROM claims
             WHERE claim_id = ?`,
            [claimId]
        );

        const updatedClaim = updatedRows[0];
        const bothConfirmed =
            Boolean(updatedClaim.reporter_confirmed) &&
            Boolean(updatedClaim.claimant_confirmed);

        // Mark the claim and item complete only after both confirmations.
        if (bothConfirmed) {
            await query(
                "UPDATE claims SET status = 'COMPLETED' WHERE claim_id = ?",
                [claimId]
            );

            await query(
                "UPDATE items SET status = 'RETURNED' WHERE item_id = ?",
                [claim.item_id]
            );
        }

        await new Promise((resolve, reject) => {
            connection.commit(err =>
                err ? reject(err) : resolve()
            );
        });

        return res.status(200).json({
            message: bothConfirmed
                ? "Handover completed! The item has been marked as returned."
                : "Your confirmation has been recorded. The other person must also confirm.",
            reporter_confirmed: Boolean(updatedClaim.reporter_confirmed),
            claimant_confirmed: Boolean(updatedClaim.claimant_confirmed),
            completed: bothConfirmed
        });

    } catch (error) {
        if (connection) {
            await new Promise(resolve => connection.rollback(resolve));
        }

        console.error("Handover confirmation error:", error);

        return res.status(500).json({
            message: "Unable to confirm handover right now."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// GET CONTACT INFORMATION FOR AN APPROVED CLAIM
app.get("/api/claims/:claimId/contact", authenticateToken, (req, res) => {
    const claimId = Number(req.params.claimId);
    const loggedInUserId = Number(req.user.user_id);

    if (!Number.isInteger(claimId) || claimId <= 0) {
        return res.status(400).json({
            message: "Invalid claim ID."
        });
    }

    const sql = `
        SELECT
            c.claim_id,
            c.status AS claim_status,
            c.user_id AS claimant_id,
            i.user_id AS reporter_id,
            reporter.name AS reporter_name,
            reporter.email AS reporter_email,
            reporter.phone AS reporter_phone,
            claimant.name AS claimant_name,
            claimant.email AS claimant_email,
            claimant.phone AS claimant_phone
        FROM claims c
        JOIN items i ON c.item_id = i.item_id
        JOIN users reporter ON i.user_id = reporter.user_id
        JOIN users claimant ON c.user_id = claimant.user_id
        WHERE c.claim_id = ?
    `;

    db.query(sql, [claimId], (err, results) => {
        if (err) {
            console.error("Claim contact error:", err);

            return res.status(500).json({
                message: "Unable to retrieve contact information."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Claim not found."
            });
        }

        const claim = results[0];

        const isReporter =
            Number(claim.reporter_id) === loggedInUserId;

        const isClaimant =
            Number(claim.claimant_id) === loggedInUserId;

        // Only the reporter and claimant may access contact details.
        if (!isReporter && !isClaimant) {
            return res.status(403).json({
                message: "You are not authorized to view these contact details."
            });
        }

        // Allow access only after approval or completion.
        if (!["APPROVED", "COMPLETED"].includes(claim.claim_status)) {
            return res.status(403).json({
                message: "Contact details are available only for approved claims."
            });
        }

        return res.json({
            message: "Contact information retrieved successfully.",
            claim_id: claim.claim_id,
            contacts: {
                reporter: {
                    name: claim.reporter_name,
                    email: claim.reporter_email,
                    phone: claim.reporter_phone
                },
                claimant: {
                    name: claim.claimant_name,
                    email: claim.claimant_email,
                    phone: claim.claimant_phone
                }
            }
        });
    });
});



// ========================================
// UPDATE LOGGED-IN USER'S PROFILE
// ========================================

app.put("/api/users/profile", authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    const { name, email, phone } = req.body;

    // Validate input
    if (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 100
    ) {
        return res.status(400).json({
            message: "Please enter a valid name (up to 100 characters)."
        });
    }

    if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        email.trim().length > 254
    ) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    if (
        typeof phone !== "string" ||
        !/^[0-9]{10}$/.test(phone.trim())
    ) {
        return res.status(400).json({
            message: "Please enter a valid 10-digit phone number."
        });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check whether another account already uses this email.
    db.query(
        "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
        [cleanEmail, userId],
        (checkError, results) => {
            if (checkError) {
                console.error("Profile email check error:", checkError);
                return res.status(500).json({
                    message: "Unable to update your profile."
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    message: "This email address is already registered."
                });
            }

            db.query(
                `UPDATE users
                 SET name = ?, email = ?, phone = ?
                 WHERE user_id = ?`,
                [cleanName, cleanEmail, cleanPhone, userId],
                (updateError, result) => {
                    if (updateError) {
                        console.error("Profile update error:", updateError);

                        if (updateError.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({
                                message: "This email address is already registered."
                            });
                        }

                        return res.status(500).json({
                            message: "Unable to update your profile."
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message: "User account not found."
                        });
                    }

                    return res.json({
                        message: "Profile updated successfully!",
                        user: {
                            user_id: userId,
                            name: cleanName,
                            email: cleanEmail,
                            phone: cleanPhone
                        }
                    });
                }
            );
        }
    );
});



// ========================================
// GET LOGGED-IN USER'S PROFILE
// ========================================

app.get("/api/users/profile", authenticateToken, (req, res) => {
    const userId = req.user.user_id;

    db.query(
        `SELECT user_id, name, email, phone, role
         FROM users
         WHERE user_id = ?`,
        [userId],
        (err, results) => {
            if (err) {
                console.error("Fetch profile error:", err);
                return res.status(500).json({
                    message: "Unable to retrieve your profile."
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "User account not found."
                });
            }

            return res.json({
                user: results[0]
            });
        }
    );
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});