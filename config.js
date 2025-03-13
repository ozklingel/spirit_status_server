require('dotenv').config();

// Configuration Constants
const DATABASE_URI = "postgresql://postgres:TH@localhost/t_h"; // or your RDS URI
const SECRET_KEY = "test";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const BUCKET = "th01-s3";
const BUCKET_PATH = "https://th01-s3.s3.eu-north-1.amazonaws.com/";

// Message Configuration
const SendMessages = {
    Whatsapp: {
        joni_text: "text",
        joni_to: "to",
        messagePrefix: "הודעה מאת: ",
        webhook: "https://tohnithadar-a7d1e-default-rtdb.firebaseio.com//joni/send.json",
    },
    Sms: {
        error_message_019:
            "unverified source number - you can verify this number with verify_phone request",
        at_least_one_error: "At least one error cause",
        message_add_to_019: "numbers to add to 019 api: ",
        problem_sms_wasnt_sent:
            "problem, message wasn't sent, please handle this problem",
        url: "https://019sms.co.il/api",
        url_test: "https://019sms.co.il/api/test",
        username: "lirangrovas",
        token:
            "eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdF9rZXkiOiI2MjI5MiIsInNlY29uZF9rZXkiOiIzNTM2NDc4IiwiaXNzdWVkQXQiOiIxNS0wMi0yMDI0IDEyOjQwOjE3IiwidHRsIjo2MzA3MjAwMH0.1DoH8hc3aS3xI-FdT7hc_E0fBW05rtlcuPdsYfGGoUw",
        token_expiration_date: "14/02/2026 12:40:17",
    },
};

const Authorization_is_On = false;

// Example Usage (if needed)

// Example using the Whatsapp configuration
console.log(SendMessages.Whatsapp.webhook);

//Example using the sms configuration
console.log(SendMessages.Sms.token);

//Example of database uri.
console.log(DATABASE_URI);

//Example of Bucket path.
console.log(BUCKET_PATH);

//Example of Authorization flag.
console.log(Authorization_is_On);