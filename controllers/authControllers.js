const passport = require('passport');
exports.geroLogin = (req, res) => {
    res.render("forms/lo-in-form")
};
exports.postLogin = passport.authenticate('local', {
        successRedirect: "/",
    failureRedirect: "/log-in",
    failureFlash: true,
});

exports.getLogout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }

        res.redirect("/");
    });
};