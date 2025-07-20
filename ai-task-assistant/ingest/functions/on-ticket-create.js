import Ticket from "../../models/tickets.js";
import User from "../../models/users.js";
import { analyzeTicket } from "../../utils/ai.js";
import { sendEmail } from "../../utils/mailer.js";
import { inngest } from "../client.js";

export const onTicketCreate = inngest.createFunction(
    { id: "on-ticket-created", retries: 3 },
    { event: "ticket.created" },
    async ({ event, step }) => {
        try {

            const { ticketId } = event.data;
            const ticket = await step.run("get-ticket", async ({ }) => {
                const ticket = await Ticket.findById(ticketId);
                if (!ticket) throw new NonRetriableError("Ticket not found");
                return ticket;
            });

            await step.run("update-ticket-status", async ({ ticket }) => {
                await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
            });


            const aiResponse = await analyzeTicket(ticket);

            const relatedSkills = await step.run("ai-processing", async () => {
                let skills = [];
                if (aiResponse) {
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        status: "IN_PROGRESS",
                        priority: ["LOW", "MEDIUM", "HIGH"].includes(aiResponse.priority) ? aiResponse.priority.toUpperCase() : "LOW",
                        helpfulNotes: aiResponse.helpfulNotes,
                        relatedSkills: aiResponse.relatedSkills || [],
                    });
                    skills = aiResponse.relatedSkills || [];
                }
                return skills;
            });

            const moderator = await step.run("assign-moderator", async () => {
                let user = await User.findOne({
                    role: "moderator",
                    skills: {
                        $elemMatch: {
                            $regex: relatedSkills.join("|"),
                            $options: "i",
                        },
                    },
                });
                if (!user) {
                    user = await User.findOne({ role: "admin" });
                }

                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user ? user._id : null,
                });
                return user;
            });


            const mail = await step.run("send-notification", async () => {
                if (moderator) {
                    await sendEmail({
                        to: moderator.email,
                        subject: `New Ticket Assigned: ${ticket.title}`,
                        text: `A new ticket has been assigned to you:\n\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nPriority: ${ticket.priority}\n\nPlease check the ticket for more details.`,
                    });
                }
            });
            return { success: true };
        } catch (error) {
            console.error("Error in onTicketCreate function:", error);
            throw new Error("Failed to process ticket creation event");
        }
    }
);