import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Trash2, ArrowRight, X, Loader } from "lucide-react";
import { fetchGroups, createGroup, deleteGroup } from "../api/groups";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import usePageTitle from "../hooks/usePageTitle";
// page title will be set inside the component

// ─── Groups Page ───────────────────────────────────────────────────────────────
// Shows all groups the user belongs to
// Allows creating and deleting groups
const Groups = () => {
  usePageTitle("Groups");
  const navigate = useNavigate();

  // ─── State ───────────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Create group modal
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  // ─── Fetch Groups on Mount ───────────────────────────────────────────────────
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await fetchGroups();
      setGroups(res.data);
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // ─── Create Group ────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createGroup(formData);
      setGroups([res.data, ...groups]); // Add new group to top of list
      setShowModal(false);
      setFormData({ name: "", description: "" }); // Reset form
      toast.success("Group created! 🎉");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  // ─── Delete Group ────────────────────────────────────────────────────────────
  const handleDelete = async (e, groupId) => {
    e.stopPropagation(); // Prevent navigating to group when clicking delete
    if (!window.confirm("Delete this group? This cannot be undone.")) return;
    try {
      await deleteGroup(groupId);
      setGroups(groups.filter((g) => g._id !== groupId)); // Remove from UI
      toast.success("Group deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete group");
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ─── Page Header ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Your Groups
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {groups.length} group{groups.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Create Group Button */}
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus size={16} />
            New Group
          </motion.button>
        </motion.div>

        {/* ─── Loading Skeletons ───────────────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-dark-800 border border-white/10 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-4 bg-white/10 rounded w-2/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-full mb-6" />
                <div className="h-3 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* ─── Empty State ─────────────────────────────────────────────────────── */}
        {!loading && groups.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-primary-400" />
            </div>
            <h3 className="text-white font-display font-bold text-xl mb-2">
              No groups yet
            </h3>
            <p className="text-white/40 text-sm mb-6">
              Create your first group to start splitting expenses
            </p>
            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Create a Group
            </motion.button>
          </motion.div>
        )}

        {/* ─── Groups Grid ─────────────────────────────────────────────────────── */}
        {!loading && groups.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {groups.map((group, index) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }} // Stagger animation
                  onClick={() => navigate(`/groups/${group._id}`)}
                  className="bg-dark-800 border border-white/10 hover:border-primary-500/50 rounded-2xl p-6 cursor-pointer transition-all group"
                >
                  {/* Group Icon + Delete Button */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                      <Users size={18} className="text-primary-400" />
                    </div>
                    <motion.button
                      onClick={(e) => handleDelete(e, group._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>

                  {/* Group Name & Description */}
                  <h3 className="text-white font-display font-bold text-lg mb-1">
                    {group.name}
                  </h3>
                  <p className="text-white/40 text-sm mb-4 line-clamp-2">
                    {group.description || "No description"}
                  </p>

                  {/* Members Count + Arrow */}
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">
                      {group.members.length} member
                      {group.members.length !== 1 ? "s" : ""}
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-white/20 group-hover:text-primary-400 transition-colors"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ─── Create Group Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-white">
                    Create New Group
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Bali Trip 🌴"
                      required
                      className="w-full bg-dark-700 border border-white/10 text-white placeholder-white/20 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Description{" "}
                      <span className="text-white/30">(optional)</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="What's this group for?"
                      rows={3}
                      className="w-full bg-dark-700 border border-white/10 text-white placeholder-white/20 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={creating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
                  >
                    {creating ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Group
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Groups;
