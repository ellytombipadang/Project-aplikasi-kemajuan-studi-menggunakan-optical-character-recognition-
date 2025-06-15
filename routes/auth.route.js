module.exports = app => {
    const auth = require("./../controller/auth");
    var router = require("express").Router();
    router.get("/", (req, res) => {
        res.send("Hello world");
    });
    router.post("/sign-in", auth.signIn);
    router.get("/user_data", auth.getUserData);
    router.post("/input_user", auth.inputUser);
    router.delete("/delete_user/:id_user", auth.delete)
    app.use("/auth", router);
};