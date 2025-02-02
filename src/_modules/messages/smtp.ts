import nodemailer from 'nodemailer';
// const transporter = require('nodemailer');

export const email = nodemailer.createTransport({
    host: 'localhost', // Use the local OpenSMTPD server
    port: Number(Bun.env.SMTP_PORT) || 25,          // Default SMTP port
    secure: false,     // No TLS for local SMTP
    // tls: {
    //     // must provide server name, otherwise TLS certificate check will fail
    //     servername: "hello.simmons.studio"
    // }
});