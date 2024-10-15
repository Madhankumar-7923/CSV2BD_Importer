import fs from "fs";
import csv from "csv-parser";
import db from "./db.js";

const dataCSV = async (filePath, tableName, res) => {
    const headers = [];
    let sampleRows = [];

    try {
        const checkTableQuery = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tableName}');`;
        const { rows } = await db.query(checkTableQuery);

        if (rows[0].exists) { //#1 check if table name already exist
            console.log(`Table "${tableName}" already exists`);
            return (res.status(400).send(`Table name "${tableName}" already exist`));
        }

        else {

            /*DATA COLLECTION FROM CSV*/

            //#2 Read CSV headers and body data Stores
            await new Promise((resolve, reject) => {
                const stream = fs.createReadStream(filePath).pipe(csv());

                stream
                    .on('headers', (csvHeaders) => {
                        headers.push(...csvHeaders); // Store headers
                    })

                    .on('data', (row) => {
                        sampleRows.push(row); // store sample rows
                        if (sampleRows.length >= 5) {
                            stream.pause();
                            resolve();
                        }
                    })

                    .on('end', () => {
                        console.log("CSV file reading completed.");
                        resolve(); // Ensure resolve is called here if the stream completes normally
                    })

                    .on('error', (err) => {
                        console.error("Error reading CSV:", err);
                        reject(err); // Handle any errors properly
                    });

            });

            /*CREATING TABLE*/

            //#3 set the datatype and headers to table

            if (headers.length === 0) {
                console.error("Error: No headers found in the CSV file.");
                return res.status(400).send("CSV file has no headers or empty.");
            }

            const columnDefinitions = headers.map(header => {

                const values = sampleRows.map(row => row[header]);

                const detectColumnType = (values) => {

                    if (values.every(value => !isNaN(value) && Number.isInteger(parseFloat(value)))) {
                        return "INTEGER";
                    }

                    if (values.every(value => !isNaN(value) && !Number.isInteger(parseFloat(value)))) {
                        return "REAL";
                    }

                    if (values.every(value => /^(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})$/.test(value))) {
                        return "DATE";
                    }

                    if (values.every(value => /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value))) {
                        return "TIME";
                    }

                    if (values.every(value => /^(true|false)$/i.test(value))) {
                        return "BOOLEAN";
                    }

                    return "TEXT";
                };

                const type = detectColumnType(values);
                return `"${header}" ${type}`;

            }).join(', ');

            console.log("CSV File has been cleaned for process"); // after setting datatype successfully

            const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (id SERIAL PRIMARY KEY, ${columnDefinitions})`;

            //#4 Create Table
            await db.query(createTableQuery);
            console.log(`Table "${tableName}" Created Successfully`);

            //#5 Function to Insert Row into Table
            const insertData = async (row) => {
                const columns = headers.map(header => `"${header}"`).join(', ');
                const valuesPlaceholders = headers.map((_, i) => `$${i + 1}`).join(', ');
                const values = headers.map(header => row[header]);

                const insertQuery = `INSERT INTO "${tableName}" (${columns}) VALUES (${valuesPlaceholders})`;
                await db.query(insertQuery, values);
            };

            //#6 Process CSV Data and Insert into the Table
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)

                    .pipe(csv())

                    .on('data', (row) => {

                        for (const key in row) { //to remove blank cell and replaced to null

                            if (row[key] === undefined || row[key].trim() === '') {
                                row[key] = null;
                            }

                        }

                        insertData(row)
                    })

                    .on('end', () => {
                        console.log("CSV File Parsed to Database Successfully");
                        resolve();
                    })

                    .on('error', (err) => reject(err));
            });

            //#7 After everything is done, send the response
            res.json({ success: true, redirectUrl: "/success", icon: "bx bxs-check-circle", message: "CSV file has been Uploaded to your database successfully!", output: `cmd: Data inserted into the table "${tableName}".` });
        }

    }

    catch (err) { // If fails send the response
        console.error("Error during CSV processing: ", err);
        res.json({ success: false, redirectUrl: "/success", icon: "bx bxs-x-circle", message: "Error processing CSV file.", output: `cmd: Creation "${tableName}" Failed.` });
    }

    //#8 use this need to flush the catch file of csv
    finally {
        try {
            fs.unlinkSync(filePath);
        }

        catch (unlinkErr) {
            console.error("Error deleting uploaded file:", unlinkErr);
        }
    }

};

export default dataCSV;