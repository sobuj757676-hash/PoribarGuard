import prisma from "@/lib/prisma";

/**
 * Utility class to read API keys dynamically from the Database (configured in Admin Panel)
 * and dispatch notifications accordingly.
 */
class NotificationService {

    // Helper to fetch key from SystemConfig
    static async getConfigValue(key) {
        try {
            const config = await prisma.systemConfig.findUnique({ where: { key } });
            return config ? config.value : null;
        } catch (e) {
            console.error(`Failed to fetch ${key} from SystemConfig`, e);
            return null;
        }
    }

    /**
     * Send an Email via SendGrid
     */
    static async sendEmail(to, subject, html) {
        const apiKey = await this.getConfigValue("sendgrid_api_key");
        if (!apiKey) {
            console.warn("SendGrid API Key not configured in Admin Settings. Skipping email.");
            return false;
        }

        try {
            const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: to }] }],
                    from: { email: "alerts@poribarguard.com", name: "PoribarGuard BD" },
                    subject: subject,
                    content: [{ type: "text/html", value: html }]
                })
            });

            if (res.ok) {
                console.log(`Email sent successfully to ${to}`);
                return true;
            } else {
                console.error("Failed to send email", await res.text());
                return false;
            }
        } catch (e) {
            console.error("SendGrid exception", e);
            return false;
        }
    }

    /**
     * Send an SMS via SSL Wireless (BD)
     */
    static async sendSMS(phone, message) {
        const apiKey = await this.getConfigValue("ssl_sms_api_key");
        if (!apiKey) {
            console.warn("SSL SMS API Key not configured in Admin Settings. Skipping SMS.");
            return false;
        }

        // Mock SSL Wireless API call (using standard BD SMS Gateway structure)
        try {
            // Note: Replace with actual SSL Wireless endpoint and payload structure for production
            console.log(`[SMS MOCK] Dispatching to ${phone}: ${message}`);
            // e.g.
            // await fetch("https://smsplus.sslwireless.com/api/v3/send-sms", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ api_token: apiKey, sid: "PORIBARGUARD", msisdn: phone, sms: message, csms_id: Date.now().toString() })
            // });
            return true;
        } catch (e) {
            console.error("SMS exception", e);
            return false;
        }
    }

    /**
     * Send Push Notification via FCM
     */
    static async sendPushMessage(fcmToken, title, body, data = {}) {
        const serverKey = await this.getConfigValue("fcm_server_key");
        if (!serverKey) {
            console.warn("FCM Server Key not configured in Admin Settings. Skipping Push.");
            return false;
        }

        try {
            const res = await fetch("https://fcm.googleapis.com/fcm/send", {
                method: "POST",
                headers: {
                    "Authorization": `key=${serverKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: fcmToken,
                    notification: { title, body, sound: "default" },
                    data: data,
                    priority: "high"
                })
            });

            if (res.ok) {
                console.log("FCM Push sent successfully");
                return true;
            } else {
                console.error("Failed to send FCM Push", await res.text());
                return false;
            }
        } catch (e) {
            console.error("FCM exception", e);
            return false;
        }
    }
}

export default NotificationService;
