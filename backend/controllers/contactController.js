const sendEmail = require('../utils/sendEmail');
const sendContactMessage = async (req, res, next) => {
    const { name, subject, email, phone, message } = req.body;
    if (!name || !subject || !email || !message) {
        return res.status(400).json({ message: 'Please fill in all required fields (Name, Subject, Email, Message).' });
    }

    try {
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>New Message from Contact Form</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <h3>Message:</h3>
                <p style="border-left: 3px solid #ccc; padding-left: 15px;">${message}</p>
            </div>`;

        await sendEmail({
            email: process.env.EMAIL_USER, 
            subject: `New Contact Message: ${subject} from ${name}`,
            message: emailHtml,
        });

        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        next(error);
    }
};

module.exports = { sendContactMessage };