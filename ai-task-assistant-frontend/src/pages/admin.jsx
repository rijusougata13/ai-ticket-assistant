import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: "", skills: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Note: Backend doesn't seem to have a "get all users" endpoint
      // We'll need to implement this or use the existing getUser endpoint differently
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        // Assuming the backend returns an array of users
        const userList = Array.isArray(data) ? data : data.users || [];
        setUsers(userList);
        setFilteredUsers(userList);
      } else {
        console.error("Failed to fetch users");
        // For now, we'll show a message that this feature isn't fully implemented
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users", err);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.email);
    setFormData({
      role: user.role,
      skills: user.skills?.join(", ") || "",
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    
    setUpdating(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/user/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: editingUser,
            role: formData.role,
            skills: formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }),
        }
      );

      if (res.ok) {
        setEditingUser(null);
        setFormData({ role: "", skills: "" });
        fetchUsers();
        alert("User updated successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(
      users.filter((user) => user.email.toLowerCase().includes(query))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl mb-6">Admin Panel - User Management</h1>
          
          {users.length === 0 ? (
            <div className="alert alert-info">
              <span>
                User management feature is not fully implemented in the backend. 
                The backend needs a "get all users" endpoint for admins to manage users.
              </span>
            </div>
          ) : (
            <>
              <div className="form-control w-full mb-6">
                <label className="label">
                  <span className="label-text">Search Users</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Search by email"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="card bg-base-200 shadow-md"
                  >
                    <div className="card-body">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{user.email}</h3>
                          <div className="badge badge-primary mt-1">{user.role}</div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-base-content/70 mb-2">Skills:</p>
                          {user.skills && user.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.skills.map((skill, index) => (
                                <div key={index} className="badge badge-outline badge-sm">
                                  {skill}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-base-content/50">No skills listed</span>
                          )}
                        </div>

                        <div className="flex justify-end">
                          {editingUser === user.email ? (
                            <div className="space-y-3 w-full">
                              <select
                                className="select select-bordered w-full"
                                value={formData.role}
                                onChange={(e) =>
                                  setFormData({ ...formData, role: e.target.value })
                                }
                              >
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                              </select>

                              <input
                                type="text"
                                placeholder="Comma-separated skills"
                                className="input input-bordered w-full"
                                value={formData.skills}
                                onChange={(e) =>
                                  setFormData({ ...formData, skills: e.target.value })
                                }
                              />

                              <div className="flex gap-2">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={handleUpdate}
                                  disabled={updating}
                                >
                                  {updating ? "Saving..." : "Save"}
                                </button>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => setEditingUser(null)}
                                  disabled={updating}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleEditClick(user)}
                            >
                              Edit User
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredUsers.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <p className="text-base-content/60">No users found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}