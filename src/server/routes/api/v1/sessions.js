const auditLog = require("../../../tools/auditLog");
const Model = require("../../../models/User");
const passport = require("passport");
const router = require("express")
  .Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, data) => {
    if (err) {
      return next(err);
    } else if (!data.token) {
      auditLog.log("authentication", {
        action: "invalid",
        method: "basic",
        username: req.body.username,
      });

      return res.sendStatus(401);
    } else if (data.user.username) {
      auditLog.log("authentication", {
        action: "login",
        method: "basic",
        username: data.user.username,
      });
    }

    res.json({
      expires: data.expires,
      token: data.token,
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return next(err);
    } else if (user.username) {
      auditLog.log("authentication", {
        action: "logout",
        method: "",
        username: user.username,
      });

      // invalidate the current token
      Model.findOneAndUpdate({ username: user.username }, {})
        .catch(updateError => {
          next(updateError);
        });
    }

    // remove session
    if (req.session) {
      req.session.destroy(() => {
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(200);
    }
  })(req, res, next);
});

router.get("/saml", passport.authenticate("saml", { session: false }));

router.post("/saml/response", (req, res, next) => {
  passport.authenticate("saml", { session: false }, (err, data) => {
    if (err) {
      return next(err);
    } else if (!data.token) {
      auditLog.log("authentication", {
        action: "invalid",
        method: "saml",
        username: "unknown",
      });

      return res.sendStatus(401);
    } else if (data.user.username) {
      auditLog.log("authentication", {
        action: "login",
        method: "saml",
        username: data.user.username,
      });
    }

    res.redirect(`/?token=${data.token}`);
  })(req, res, next);
});

router.post("/valid", (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, token) => {
    if (token) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  })(req, res, next);
});

module.exports = router;
