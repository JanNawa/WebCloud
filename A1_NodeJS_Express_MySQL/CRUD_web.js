const express = require('express');
const mysql = require('mysql');
const app = express ();
app.use(express.json());
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Create connection
const db = mysql.createConnection({
    host :'127.0.0.1',
    user: 'root',
    password: 'password',
    port: '3306',
    database: 'cloud'
});

//Connect
db.connect((err)=>{
    if (err){
        console.log('Connection Error')
        throw err;
    }
    console.log('mysql Connected');
});

// Landing page
app.get('/',(req,res)=>{
    res.send('Hello world from / with NodeJS, Express, mySQL')
});

// GET - get all jobs
app.get('/api/jobs',(req,res)=>{
    let sql ='SELECT * FROM jobs'
    let query = db.query(sql,(err,jobs)=>{
        if (err){
            throw err;
        }
        console.log(jobs);
        res.send(jobs);
    });
});

// GET - get a specific job with id parameters
app.get ('/api/jobs/:jobID/:partID', (req,res) => {
    const sql ='SELECT * FROM jobs WHERE jobID = ? AND partID = ?';
    const jobID = [req.params.jobID];
    const partID = [req.params.partID];
    console.log(sql);
    let query = db.query(sql, [jobID, partID], (err, result)=>{
        if (err){
            throw err;
        }
        console.log(result);
        if (result.length == 0) {
            res.status(404).send('ID: ' + jobID + partID + ' was not found');
            return;
        }
        res.send(result);
    });
});

// create application/json parser
const jsonParser = bodyParser.json()

// POST - insert new job
app.post('/api/jobs', jsonParser, (req,res) => {
    const jobIDInput = req.body.jobID;
    const partIDInput = req.body.partID;
    const qtyInput = req.body.qty;
    // validate all 3 parameters
    if (validInput(jobIDInput, partIDInput, qtyInput)){
        console.log ('In app.post with jobID: ' + jobIDInput + '\n' +
            ' partID: ' + partIDInput + '\n' +
            ' qty: ' + qtyInput);
        const sqlSelect ='SELECT * FROM jobs WHERE jobID = ? AND partID = ?';
        const sqlInsert ='INSERT INTO jobs SET ?'
        const data = {jobID: jobIDInput,
            partID: partIDInput,
            qty: qtyInput};
        console.log(data);
        let querySelect = db.query(sqlSelect, [jobIDInput, partIDInput], (err, result) => {
            if (err){
                throw err;
            }
            console.log(result);
            if(result.length == 0){
                console.log('part not found and to be inserted/pushed');
                let query = db.query(sqlInsert, data, (err, jobs) => {
                    if (err){
                        throw err;
                    }
                    res.send('Data {'+ data.jobID + ', '+ data.partID + ', ' + data.qty + '} inserted in the table');
                });
            } else {
                console.log('ID ' + jobIDInput + partIDInput +' already exists');
                res.status(404).send('ID ' + jobIDInput + partIDInput +' already exists');
                return;
            }
        });
    } else { // invalid parameters
        console.log ('Invalid input with jobID: ' + jobIDInput + '\n' +
            ' partID: ' + partIDInput + '\n' +
            ' qty: ' + qtyInput);
        res.status(404).send('Invalid Input');
        return;
    }
});

// PUT - update the existing job
app.put('/api/jobs', jsonParser, (req,res) => {
    const jobIDInput = req.body.jobID;
    const partIDInput = req.body.partID;
    const qtyInput = req.body.qty;
    // validate all 3 parameters
    if (validInput(jobIDInput, partIDInput, qtyInput)){
        console.log ('In app.update with jobID: ' + jobIDInput + '\n' +
            ' partID: ' + partIDInput + '\n' +
            ' qty: ' + qtyInput);
        const sqlSelect ='SELECT * FROM jobs WHERE jobID = ? AND partID = ?';
        const sqlUpdate ='UPDATE jobs SET ? WHERE jobID = ? AND partID = ?';
        const data = {qty: qtyInput};
        console.log(data);
        let querySelect = db.query(sqlSelect , [jobIDInput, partIDInput], (err, result) => {
            console.log(result);
            if(result.length != 0){
                console.log('part found to be updated');
                let queryUpdate = db.query(sqlUpdate, [data, jobIDInput, partIDInput], (err, job)=>{
                    if (err) {
                        throw err;
                    }
                    res.send('Data { jobID: '+ jobIDInput + ', partID: ' + partIDInput + 
                        ', qty: ' + qtyInput +' } updated in table');
                });
            } else {
                res.status(404).send('Part not found with ID ' + jobIDInput + partIDInput);
                return;
            } 
        });
    } else { // invalid parameters
        console.log ('Invalid input with jobID: ' + jobIDInput + '\n' +
            ' partID: ' + partIDInput + '\n' +
            ' qty: ' + qtyInput);
        res.status(404).send('Invalid Input');
        return;
    }
});

const maxVarCharLength = 10;
// validate input for jobs table
function validInput(jobID, partID, qty){
    return jobID.length <= maxVarCharLength && validInt(partID) && validInt(qty);
}

const maxInt = 2147483647
// validate integer
function validInt(int){
    return !isNaN(int) && parseInt(int) < maxInt && parseInt(int) > 0 && int % 1 == 0;
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('listening on port....'+ port));
