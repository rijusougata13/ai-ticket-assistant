import mongoose from "mongoose";


const ticketSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: {
        type: String,
        default: "TODO",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    priority: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    deadline: Date,
    helpfulNotes: String,
    skills: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;