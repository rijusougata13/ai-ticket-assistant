import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      const data = await res.json();
      // Backend returns tickets directly, not in a tickets property
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        fetchTickets(); // Refresh list
        alert("Ticket created successfully!");
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Create New Ticket</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter ticket title"
                className="input input-bordered w-full"
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the issue or request in detail"
                className="textarea textarea-bordered w-full h-32"
                required
              ></textarea>
            </div>
            
            <button 
              className="btn btn-primary w-full" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                "Create Ticket"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">My Tickets</h2>
          
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-base-content/60">No tickets found. Create your first ticket above!</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  to={`/tickets/${ticket._id}`}
                  className="block"
                >
                  <div className="card bg-base-200 hover:bg-base-300 transition-colors duration-200 cursor-pointer">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="card-title text-lg">{ticket.title}</h3>
                          <p className="text-base-content/70 mt-2 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {ticket.status && (
                            <div className="badge badge-primary">{ticket.status}</div>
                          )}
                          {ticket.priority && (
                            <div className={`badge ${
                              ticket.priority === 'HIGH' ? 'badge-error' :
                              ticket.priority === 'MEDIUM' ? 'badge-warning' :
                              'badge-info'
                            }`}>
                              {ticket.priority}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm text-base-content/60">
                        <span>
                          Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        {ticket.assignedTo && (
                          <span>Assigned to: {ticket.assignedTo.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}