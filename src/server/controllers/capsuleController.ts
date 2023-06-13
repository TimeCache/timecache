import crypto from 'crypto';
const pool = require('./db');
const cron = require('node-cron');
const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const capsuleController = {
    getMyCapsule: async (req, res, next) => {
        next();
    },

    generateAccessCode: (req, res, next) => {
        res.locals.accessCode = crypto.randomBytes(16).toString('hex');



        console.log('access code generated!')
        next();
    },

    saveToDatabase: async (req, res, next) => {

        // TODO: create a new capsule in the database
        // TODO: save the new access code from res.locals.accessCode 
                
        console.log('new capsule saved to database!')
        next();
    },

    sendToS3: async (req, res, next) => {

        // TODO: create a new bucket in S3 with the name of the access code(?)

        console.log('new capsule sent to S3!')
        next();
    },

    activateCountdown: async (req, res, next) => {

        // TODO: create a new capsule in the database
        const { recipientPhone, dueDate, id: capsuleId } = req.body; 

        // set up a cron job
        const task = cron.schedule(`0 * * *`, async () => {
          const now = new Date();

          if (now >= new Date(dueDate)) {

            // send the SMS
            await twilioClient.messages.create({
              body: `You've recieved a TimeCache time capsule! Access it with this code: ${req.accessCode}`,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: recipientPhone
            });

            // Stop the cron job when the due date has been reached
            task.destroy();  

            // update the status of the capsule in the database
            const updateQuery = 'UPDATE timeCapsules SET status = $1 WHERE id = $2';
            await pool.query(updateQuery, ['sent', capsuleId]);
          }
        }, {
          scheduled: false
        });

          // Start the cron job
        task.start();

        console.log('countdown activated!')
        next();
    }

}










