const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Company CI/CD Demo Application");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy"
    });
});

app.get("/version", (req, res) => {
    res.json({
        version: "1.0.0"
    });
});

app.get("/cloud",(req, res) =>{
    res.json({
        name:"bakry",
        age:"29"
    })
}
)

app.listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
});

module.exports = app;
