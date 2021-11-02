const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')
const bodyParser = require('body-parser')
const { restart } = require('nodemon')
const bcrypt = require('bcrypt')
const saltRounds = 10


const cookieParser = require("cookie-parser");
const session = require("express-session");

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'eteration',
    database: 'markers',
})

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}))

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(session({
    key: "name",
    secret: "eteration",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24,
    },
}))


app.get("/api/get", (req, res) => {
    const sqlGet = "SELECT drop_time, lat, lng FROM marker_infos";
    db.query(sqlGet, (err, result) => {
        res.send(result);
    });

})

app.post("/api/insert", (req, res) => {

    const drop_time = req.body.drop_time;
    const lat = req.body.lat;
    const lng = req.body.lng;

    const sqlInsert = "INSERT INTO marker_infos (drop_time, lat, lng) VALUES (?,?,?)";
    db.query(sqlInsert, [drop_time, lat, lng], (err, result) => { });
});

app.post("/api/checkPerson", (req, res) => {
    const name = req.body.name;
    const password = req.body.password;

    db.query(
        "SELECT * FROM users WHERE name = ?;",
        name,
        (err, result) => {
            if (err) {
                res.send({ err: err })
            }

            if (result.length > 0) {
                console.log(password, result[0].password);
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        req.session.user = result;
                        res.send(result)
                    } else {
                        res.send({ message: "Wrong combination" })
                    }
                })
            } else {
                res.send({ message: "user not exist" })
            }

        }
    );

});

app.get("/api/login", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.name });
    } else {
        res.send({ loggedIn: false });
    }
});

app.post("/api/savePerson", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    console.log(name, email, password);

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err)
        }

        const sqlInsert = "INSERT INTO users (name, email, password) VALUES (?,?,?)";
        db.query(sqlInsert, [name, email, hash], (err, result) => { });
    })
});

app.listen(3001, () => {
    console.log("running");
});