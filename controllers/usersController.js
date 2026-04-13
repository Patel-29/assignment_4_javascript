const bcrypt = require("bcryptjs");
const db = require("../db/usersQueries.js");
const { body, validationResult } = require("express-validator");

exports.getSignUp = (req, res) => {
    res.render("forms/sign-up-form")
}

exports.postSignUp = [

    // Sanitize fields
     body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required.')
    .escape(),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required.')
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match.');
    }
    return true;
  }),


  // Validate the results of req
  async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('forms/sign-up-form', {
        title: 'Sign Up',
        errors: errors.array(),
        previousData: req.body,
      });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = await db.createUser(
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            hashedPassword
        );

        req.login(user, (err) => {
            if(err) return next(err);
            return res.redirect("/")
        });
    } catch(err) {
        return next(err)
    }
},
];

exports.getMembership = (req, res) => {
  if (!req.user) return res.redirect("/log-in");
  if (req.user.is_member) return res.redirect("/");

  res.render("forms/passcode-form", {
    title: "Unlock Member Status",
    target: "Member",
    action: "/membership"
  });
};

exports.postMembership = async (req, res, next) => {
  const passcode = req.body.passcode?.trim();
  const secretCode = process.env.MEMBER_PASSCODE;

  if(passcode !== secretCode) {
    return res.render("forms/passcode-form", {
      title: "Unlock Member Status",
      target: "Member",
      action: "/membership",
      errors: ["Incorrect passcode. Try again"]
    })
  }

  try {
    await db.updateUserMembership(req.user.id);
    res.redirect("/");
  } catch (err) {
    return next(err);
  }
};

exports.getAdmin = (req, res) => {
  if (!req.user) return res.redirect('/log-in');
  if (req.user.is_admin) return res.redirect('/');
  
  res.render('forms/passcode-form', {
    title: 'Become an Admin',
    target: 'Admin',
    action: '/admin',
  });
};

exports.postAdmin = async (req, res) => {
  const passcode = req.body.passcode?.trim();
  const secretCode = process.env.ADMIN_PASSCODE;

  if (passcode !== secretCode) {
    return res.render('forms/passcode-form', {
      title: 'Become an Admin',
      target: 'Admin',
      action: '/admin',
      errors: ['Incorrect passcode. Try again!'],
    });
  }

  try {
    await db.updateUserAdminStatus(req.user.id);
    res.redirect('/');
  } catch (err) {
    return next(err);
  }
};

