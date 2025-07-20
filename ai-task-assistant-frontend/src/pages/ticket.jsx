import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setTicket(data.ticket);
        } else {
          setError(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <Link to="/" className="btn btn-primary mt-4">
          Back to Tickets
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="alert alert-warning">
          <span>Ticket not found</span>
        </div>
        <Link to="/" className="btn btn-primary mt-4">
          Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4">
        <Link to="/" className="btn btn-ghost">
          ← Back to Tickets
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-start mb-4">
            <h1 className="card-title text-3xl">{ticket.title}</h1>
            <div className="flex flex-col space-y-2">
              {ticket.status && (
                <div className="badge badge-primary badge-lg">{ticket.status}</div>
              )}
              {ticket.priority && (
                <div className={`badge badge-lg ${
                  ticket.priority === 'HIGH' ? 'badge-error' :
                  ticket.priority === 'MEDIUM' ? 'badge-warning' :
                  'badge-info'
                }`}>
                  {ticket.priority}
                </div>
              )}
            </div>
          </div>

          <div className="divider">Description</div>
          <div className="prose max-w-none">
            <p className="text-lg">{ticket.description}</p>
          </div>

          {/* Extended ticket information */}
          {(ticket.relatedSkills?.length > 0 || ticket.helpfulNotes || ticket.assignedTo) && (
            <>
              <div className="divider">AI Analysis & Assignment</div>
              
              {ticket.relatedSkills?.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Related Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {ticket.relatedSkills.map((skill, index) => (
                      <div key={index} className="badge badge-outline badge-lg">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ticket.helpfulNotes && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">AI Analysis & Helpful Notes</h3>
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="prose max-w-none">
                      <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {ticket.assignedTo && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Assignment</h3>
                  <div className="alert alert-info">
                    <span>Assigned to: <strong>{ticket.assignedTo.email}</strong></span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="divider">Metadata</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Created:</span> {new Date(ticket.createdAt).toLocaleString()}
            </div>
            {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
              <div>
                <span className="font-semibold">Updated:</span> {new Date(ticket.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}