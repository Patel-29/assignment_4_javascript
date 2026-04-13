const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("../db/pool.js");

// Authentication behind the scene
passport.use(
    new LocalStrategy ({ usernameField: 'email', passwordField: "password" },
        async (email, password, done) => {
        try {
            const { rows } = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email],
            );

            const user = rows[0];

            if(!user) {
                return done(null, false, {message: "Incorrect email"});
            }
            const match = await bcrypt.compare(password, user.password_hash)
            if(!match) {
                // passwords do not match!
                return done(null, false, {message: "Incorrect password"});
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })

);

// Sessions and Serialization
passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id],
        );
        const user = rows[0];
        done(null, user)
    } catch (err) {
        done(err);
    }
});

module.exports = passport;