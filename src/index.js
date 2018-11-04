const express = require('express')
const axios = require('axios')
const fs = require('fs')
const app = express()
const port = 3000

app.use(express.static('public'));
app.post('/detect', (req, res) => {
    const data = [];
    req.on('data', chunk => { data.push(chunk); });
    req.on('end', () => {
        const buffer = Buffer.concat(data);
        axios.post(
            `${process.env.API_URL}/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender`,
            buffer,
            { 
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Ocp-Apim-Subscription-Key': process.env.AUTH_KEY,        
                },
            }
        ).then(response => {
            res.send(response.data);
        }).catch(err => {
            res.status(500).send(err.message);
        });
    });
})

app.listen(port, () => console.log(`App listening on port ${port}! Starting with key ${process.env.AUTH_KEY} agains ${process.env.API_URL}`))