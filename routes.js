const express = require('express');
const router = express.Router();
const HistoryEntry = require('./historyEntry'); 
const db = require('./db');
require('dotenv').config();
const ejs = require('ejs'); 





router.get('/', (req, res) => {
    ejs.renderFile('./data.html', (err, html) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error rendering history page' });
        } else {
            res.send(html);
        }
    });
});







// Route to fetch and display history data with pagination
router.get('/history', async (req, res) => {
    try {
        const itemsPerPage = 10;
        const totalItems = await HistoryEntry.countDocuments();
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        let currentPage = req.query.page ? parseInt(req.query.page) : 1;
        currentPage = Math.min(currentPage, 2);

        const historyData = await HistoryEntry.find()
            .sort({ _id: -1 })
            .skip((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage);

        ejs.renderFile('./history/history.html', { historyData, currentPage, totalPages }, (err, html) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Error rendering history page' });
            } else {
                res.send(html);
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching history data' });
    }
});





// Function to check if a string is numeric
function isNumeric(str) {
    return !isNaN(parseFloat(str)) && isFinite(str);
}






// Function to calculate mathematical expression
function calculateExpression(expression) {
    try {
        const result = eval(expression);
        return result;
    } catch (error) {
        return "Error: Invalid expression";
    }
}







// Function to process concatenated input string
function processConcatenatedString(inputString) {
    let check = 0;
    const stringLength = inputString.length;
    let answer = "";

    for (let i = 0; i < stringLength; i++) {
        let c = '';
        while (inputString[i] !== '#' && i < stringLength) {
            c = c + inputString[i];
            i++;
        }

        if (check === 0) {
            if (!isNumeric(c)) {
                // Error if not numeric
                throw new Error("Invalid input: " + c);
            }
            answer = answer + c;
            check = 1;
        } else {
            c = c.toLowerCase();
            if (c === 'plus') {
                answer = answer + '+';
            } else if (c === 'minus') {
                answer = answer + "-";
            } else if (c === 'mod') {
                answer = answer + "%";
            } else if (c === 'into') {
                answer = answer + "*";
            } else if (c === 'pow') {
                answer = answer + "**";
            } else if (c === 'by') {
                answer = answer + "/";
            } else {
                throw new Error("Invalid input: " + c);
            }

            check = 0;
        }
    }
    const finalanswer = calculateExpression(answer);
    return { answer, finalanswer };
}







// Route to process the concatenated input string
router.get('/:values*', (req, res) => {
    const values = req.params.values + (req.params[0] || '');
    const concatenatedString = values.replace(/\//g, '#');

    try {
        const { answer, finalanswer } = processConcatenatedString(concatenatedString);

        // Create a new HistoryEntry and save it to the database
        const historyEntry = new HistoryEntry({
            question: answer,
            answer: finalanswer
        });
        historyEntry.save();

        res.json({
            question: answer,
            answer: finalanswer
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});





module.exports = router;