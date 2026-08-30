package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service implementation for dispatching automated registration approval credentials emails.
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async
    public void sendCredentialsEmail(String toEmail, String fullName, String username, String temporaryPassword) {
        String subject = "Account Approved - Carbon Footprint Monitoring System";
        String body = String.format("""
                Dear %s,

                Congratulations! Your account registration for the Carbon Footprint Monitoring System has been APPROVED by the System Administrator.

                Your Temporary Login Credentials are provided below:

                -----------------------------------------------------
                Username:           %s
                Temporary Password: %s
                -----------------------------------------------------

                Instructions for First Login:
                1. Navigate to the Login Page (http://localhost:5173/login).
                2. Enter your Username/Email and Temporary Password.
                3. Upon successful login, you will be automatically redirected to the 'Reset Password' page.
                4. Set your new secure password.

                Note: For security reasons, please do not share your temporary credentials with anyone.

                Best Regards,
                Carbon Footprint Monitoring System Team
                """, fullName, username, temporaryPassword);

        // Always log credentials to console for local testing / development visibility
        logger.info("=================================================================");
        logger.info(" DISPATCHING CREDENTIALS EMAIL TO: {}", toEmail);
        logger.info(" Full Name: {}", fullName);
        logger.info(" Username: {}", username);
        logger.info(" Temp Password: {}", temporaryPassword);
        logger.info("=================================================================");

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                logger.info("Email sent successfully to {}", toEmail);
            } catch (Exception e) {
                logger.warn("Could not send email via SMTP (using dev fallback console log): {}", e.getMessage());
            }
        }
    }

    @Override
    @Async
    public void sendRejectionEmail(String toEmail, String fullName, String remark) {
        String subject = "Registration Update - Carbon Footprint Monitoring System";
        String body = String.format("""
                Dear %s,

                We regret to inform you that your registration request for the Carbon Footprint Monitoring System could not be approved at this time.

                Reason / Remark: %s

                If you believe this is an error, please re-submit your registration with accurate document details or contact the System Administrator.

                Best Regards,
                Carbon Footprint Monitoring System Team
                """, fullName, remark != null ? remark : "Application requirements not satisfied");

        logger.info("=================================================================");
        logger.info(" DISPATCHING REJECTION EMAIL TO: {}", toEmail);
        logger.info(" Remark: {}", remark);
        logger.info("=================================================================");

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                logger.info("Rejection email sent successfully to {}", toEmail);
            } catch (Exception e) {
                logger.warn("Could not send rejection email via SMTP: {}", e.getMessage());
            }
        }
    }
}
