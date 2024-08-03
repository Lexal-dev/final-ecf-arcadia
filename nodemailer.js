require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secureConnection: false,
    tls: {
        ciphers: "SSLv3",
    },
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


const mailOptions = {
    from: "nekodev67@outlook.com",
    to: "alexislandolt67@gmail.com",
    subject: "E-mail depuis outlook",
    text: "On change de support mail parce que google voila quoi"
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Email envoyé: ${info.response}`);
    }
});