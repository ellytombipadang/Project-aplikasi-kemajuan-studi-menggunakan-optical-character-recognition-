module.exports = app => {
    const auth = require("./../controller/auth");
    var router = require("express").Router();
    router.get("/", (req, res) => {
        res.send("Hello world");
    });
    router.post("/sign-in", auth.signIn);
    app.use("/auth", router);
};