import { NonRetriableError } from "inngest";
import { inngest } from "../client.js";

export const onSignup = inngest.createFunction(
    { id: "on-signup", retries: 3 },
    { event: "user.signup" },
    async ({ event, step }) => {
        try {
            const { email } = event.data;
            await step.run("get-user-email", async ({ }) => {
                const user = await User.findOne({ email });
                if (!user) throw new NonRetriableError("User not found");
                return user;
            });

            await step.run("send-welcome-email", async ({ user }) => {
                const subject = "Welcome to the Ticketing System";
                const text = `Hello ${user.email},\n\nThank you for signing up! We're excited to have you on board.`;
                return sendEmail(user.email, subject, text);
            });

            return { success: true }
        } catch (error) {
            console.error("Error in onSignup function:", error);
            throw new Error("Failed to process signup event");
        }
    });