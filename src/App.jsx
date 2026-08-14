import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Plus,
  Search,
  Bell,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  MoreHorizontal,
  X,
} from "lucide-react";

function App() {
  // =========================================
  // STATE
  // =========================================

  const [activePage, setActivePage] = useState("dashboard");

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [tickets, setTickets] = useState([]);

  const [ticketsLoading, setTicketsLoading] = useState(true);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Network",
    priority: "Medium",
  });

  // =========================================
  // FETCH TICKETS FROM MONGODB
  // =========================================

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/tickets"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch tickets"
        );
      }

      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch tickets error:", error);
    } finally {
      setTicketsLoading(false);
    }
  };

  // =========================================
  // DASHBOARD STATISTICS
  // =========================================

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const highPriorityTickets = tickets.filter(
    (ticket) =>
      ticket.priority === "High" ||
      ticket.priority === "Critical"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  // =========================================
  // SEARCH
  // =========================================

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      ticket.title?.toLowerCase().includes(search) ||
      ticket.description?.toLowerCase().includes(search) ||
      ticket.ticketId?.toLowerCase().includes(search) ||
      ticket.category?.toLowerCase().includes(search) ||
      ticket.priority?.toLowerCase().includes(search) ||
      ticket.status?.toLowerCase().includes(search)
    );
  });

  // =========================================
  // CREATE TICKET
  // =========================================

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title.trim() ||
      !formData.description.trim()
    ) {
      setMessage(
        "⚠️ Title and description are required."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/tickets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create ticket"
        );
      }

      // Backend may return an object or an array
      const createdTicket = Array.isArray(data)
        ? data[0]
        : data.ticket || data;

      // Add new ticket immediately to UI
      if (createdTicket && createdTicket._id) {
        setTickets((prevTickets) => [
          createdTicket,
          ...prevTickets,
        ]);
      } else {
        // Fallback: fetch again from MongoDB
        await fetchTickets();
      }

      setMessage(
        "✅ Ticket created successfully!"
      );

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "Network",
        priority: "Medium",
      });

      // Close modal
      setTimeout(() => {
        setShowTicketForm(false);
        setMessage("");
      }, 1000);
    } catch (error) {
      console.error(
        "Create ticket error:",
        error
      );

      setMessage(
        `❌ ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // AI TICKET ANALYSIS
  // =========================================

  const handleAnalyzeTicket = async () => {
    if (!selectedTicket?._id) {
      console.error("No ticket selected");
      return;
    }

    try {
      setAiLoading(true);

      console.log("🤖 Sending ticket for AI analysis...");

      const response = await fetch(
        `http://localhost:5000/api/tickets/${selectedTicket._id}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("AI response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to analyze ticket"
        );
      }

      if (!data.ticket) {
        throw new Error("Backend did not return the updated ticket.");
      }

      // Update the currently opened ticket
      setSelectedTicket(data.ticket);

      // Update the same ticket in the main list
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === data.ticket._id
            ? data.ticket
            : ticket
        )
      );

      console.log("✅ AI analysis completed");
    } catch (error) {
      console.error("❌ AI analysis error:", error);
      alert(`AI analysis failed: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // =========================================
  // CLOSE MODAL
  // =========================================

  const closeTicketForm = () => {
    if (loading) {
      return;
    }

    setShowTicketForm(false);
    setMessage("");

    setFormData({
      title: "",
      description: "",
      category: "Network",
      priority: "Medium",
    });
  };

  // =========================================
  // PRIORITY STYLE
  // =========================================

  const getPriorityClass = (priority) => {
    if (priority === "Critical") {
      return "bg-red-100 text-red-700";
    }

    if (priority === "High") {
      return "bg-red-50 text-red-600";
    }

    if (priority === "Medium") {
      return "bg-amber-50 text-amber-600";
    }

    return "bg-emerald-50 text-emerald-600";
  };

  // =========================================
  // STATUS STYLE
  // =========================================

  const getStatusClass = (status) => {
    if (status === "Resolved") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-blue-600";
    }

    return "bg-slate-100 text-slate-600";
  };

  // =========================================
  // UI
  // =========================================

  return (
    <>
    {/* =====================================
    TICKET DETAILS MODAL
====================================== */}

{selectedTicket && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

      {/* Modal Header */}
      <div className="flex items-start justify-between border-b border-slate-200 p-6">

        <div>
          <p className="text-xs font-semibold text-slate-400">
            {selectedTicket.ticketId}
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {selectedTicket.title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ticket details and AI investigation
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedTicket(null)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>

      </div>

      {/* Ticket Details */}
      <div className="space-y-6 p-6">

        {/* Badges */}
        <div className="flex flex-wrap gap-3">

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {selectedTicket.category}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
              selectedTicket.priority
            )}`}
          >
            {selectedTicket.priority}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
              selectedTicket.status
            )}`}
          >
            {selectedTicket.status}
          </span>

        </div>

        {/* Description */}
        <div>
          <h3 className="mb-2 text-sm font-bold text-slate-800">
            Description
          </h3>

          <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {selectedTicket.description}
          </div>
        </div>

        {/* =================================
            AI INVESTIGATION
        ================================== */}

        <div className="rounded-2xl bg-slate-900 p-5 text-white">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                🤖
              </div>

              <div>
                <h3 className="font-bold">
                  AI Investigation
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Analyze this incident and get troubleshooting
                  recommendations.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={handleAnalyzeTicket}
              disabled={aiLoading}
              className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? "Analyzing..." : "Analyze Ticket ✨"}
            </button>

          </div>

        </div>

        {/* =================================
            AI RESULTS
        ================================== */}

        <div className="space-y-4">

          {/* Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              AI Summary
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {selectedTicket.aiAnalysis?.summary ||
                "No AI analysis generated yet. Click \"Analyze Ticket\" to investigate this incident."}
            </p>

          </div>

          {/* Possible Cause */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Possible Cause
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {selectedTicket.aiAnalysis?.possibleCause ||
                "The AI will identify possible causes based on the ticket description."}
            </p>

          </div>

          {/* Suggested Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Suggested Actions
            </p>

            {selectedTicket.aiAnalysis?.suggestedActions?.length > 0 ? (
              <ul className="mt-3 space-y-2">

                {selectedTicket.aiAnalysis.suggestedActions.map(
                  (action, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm leading-6 text-slate-600"
                    >
                      <span className="font-bold text-emerald-500">
                        ✓
                      </span>

                      <span>{action}</span>
                    </li>
                  )
                )}

              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-400">
                AI troubleshooting steps will appear here.
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  </div>
)}
      {/* =====================================
          CREATE TICKET MODAL
      ====================================== */}

      {showTicketForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create New Ticket 🎫
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a support incident.
                </p>
              </div>

              <button
                type="button"
                onClick={closeTicketForm}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateTicket}
              className="space-y-5 p-6"
            >

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Issue Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. VPN is not connecting"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  rows="4"
                  placeholder="Describe the technical problem..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {/* Category + Priority */}
              <div className="grid gap-4 sm:grid-cols-2">

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>

                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="Network">
                      Network
                    </option>

                    <option value="Email">
                      Email
                    </option>

                    <option value="Access">
                      Access
                    </option>

                    <option value="Security">
                      Security
                    </option>

                    <option value="Hardware">
                      Hardware
                    </option>

                    <option value="Performance">
                      Performance
                    </option>

                    <option value="Software">
                      Software
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Priority
                  </label>

                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Critical">
                      Critical
                    </option>
                  </select>
                </div>

              </div>

              {/* Message */}
              {message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    message.startsWith("✅")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeTicketForm}
                  disabled={loading}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Creating..."
                    : "Create Ticket"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================
          MAIN APPLICATION
      ====================================== */}

      <div className="min-h-screen bg-slate-50 text-slate-900">

        <div className="flex min-h-screen">

          {/* =================================
              SIDEBAR
          ================================== */}

          <aside className="hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">

            {/* Logo */}
            <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xl shadow-sm">
                🤖
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  DigiPlus
                </h1>

                <p className="text-xs text-slate-500">
                  AI Service Desk
                </p>
              </div>

            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">

              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Workspace
              </p>

              <div className="space-y-1">

                {/* Dashboard */}
                <button
                  type="button"
                  onClick={() =>
                    setActivePage("dashboard")
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    activePage === "dashboard"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>

                {/* Tickets */}
                <button
                  type="button"
                  onClick={() =>
                    setActivePage("tickets")
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    activePage === "tickets"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Ticket size={18} />
                  Tickets
                </button>

              </div>
            </nav>

            {/* AI Card */}
            <div className="m-4 rounded-2xl bg-slate-900 p-4 text-white">

              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                ✨
              </div>

              <p className="text-sm font-semibold">
                AI Assistant
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Intelligent ticket analysis and
                troubleshooting will be added here.
              </p>

            </div>
          </aside>

          {/* =================================
              MAIN
          ================================== */}

          <main className="flex-1">

            {/* Header */}
            <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">

              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {activePage === "dashboard"
                    ? "Dashboard"
                    : "Tickets"}
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {activePage === "dashboard"
                    ? "Monitor and resolve support incidents."
                    : "View and manage all support incidents."}
                </p>
              </div>

              <div className="flex items-center gap-3">

                {/* Search */}
                <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">

                  <Search
                    size={17}
                    className="text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="w-44 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />

                </div>

                {/* Notification */}
                <button
                  type="button"
                  className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
                >
                  <Bell size={18} />

                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* New Ticket */}
                <button
                  type="button"
                  onClick={() =>
                    setShowTicketForm(true)
                  }
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <Plus size={17} />

                  <span className="hidden sm:inline">
                    New Ticket
                  </span>
                </button>

              </div>
            </header>

            {/* =================================
                DASHBOARD PAGE
            ================================== */}

            {activePage === "dashboard" && (
              <div className="p-6 lg:p-8">

                {/* Welcome */}
                <div className="mb-7">

                  <p className="text-sm font-medium text-slate-500">
                    Good morning 👋
                  </p>

                  <h3 className="mt-1 text-2xl font-bold tracking-tight">
                    Here's what's happening today.
                  </h3>

                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  {/* Total */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <Ticket
                          size={19}
                          className="text-slate-700"
                        />
                      </div>

                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <ArrowUpRight size={14} />
                        Live
                      </span>

                    </div>

                    <p className="mt-5 text-sm font-medium text-slate-500">
                      Total Tickets
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {totalTickets}
                    </p>

                  </div>

                  {/* Open */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                        <Clock3
                          size={19}
                          className="text-amber-600"
                        />
                      </div>

                      <span className="text-xs font-semibold text-slate-400">
                        Active
                      </span>

                    </div>

                    <p className="mt-5 text-sm font-medium text-slate-500">
                      Open Tickets
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {openTickets}
                    </p>

                  </div>

                  {/* High Priority */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                        <AlertTriangle
                          size={19}
                          className="text-red-600"
                        />
                      </div>

                      <span className="text-xs font-semibold text-red-500">
                        Attention
                      </span>

                    </div>

                    <p className="mt-5 text-sm font-medium text-slate-500">
                      High Priority
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {highPriorityTickets}
                    </p>

                  </div>

                  {/* Resolved */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                        <CheckCircle2
                          size={19}
                          className="text-emerald-600"
                        />
                      </div>

                      <span className="text-xs font-semibold text-emerald-600">
                        Resolved
                      </span>

                    </div>

                    <p className="mt-5 text-sm font-medium text-slate-500">
                      Resolved
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {resolvedTickets}
                    </p>

                  </div>

                </div>

                {/* Recent Incidents */}
                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="font-bold">
                        Recent Incidents
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Latest support requests.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActivePage("tickets")
                      }
                      className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                    >
                      View all →
                    </button>

                  </div>

                  {/* Recent Tickets */}
                  <div className="divide-y divide-slate-100">

                    {ticketsLoading ? (
                      <div className="p-8 text-center text-sm text-slate-500">
                        Loading tickets...
                      </div>
                    ) : filteredTickets.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500">
                        No tickets found.
                      </div>
                    ) : (
                      filteredTickets
                        .slice(0, 5)
                        .map((ticket) => (
                          <div
                           key={ticket._id}
                               onClick={() => setSelectedTicket(ticket)}
                          className="grid cursor-pointer gap-4 px-5 py-5 transition hover:bg-slate-50 md:grid-cols-6 md:items-center"
                            >

                            <div className="flex min-w-0 items-center gap-4">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                🎫
                              </div>

                              <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                  <span className="text-xs font-semibold text-slate-400">
                                    {ticket.ticketId}
                                  </span>

                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                    {ticket.category}
                                  </span>

                                </div>

                                <h4 className="mt-1 truncate text-sm font-semibold text-slate-800">
                                  {ticket.title}
                                </h4>

                                <p className="mt-1 text-xs text-slate-400">
                                  Created{" "}
                                  {ticket.createdAt
                                    ? new Date(
                                        ticket.createdAt
                                      ).toLocaleString()
                                    : "Recently"}
                                </p>

                              </div>

                            </div>

                            <div className="flex items-center gap-3">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                                  ticket.priority
                                )}`}
                              >
                                {ticket.priority}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                  ticket.status
                                )}`}
                              >
                                {ticket.status}
                              </span>

                              <MoreHorizontal
                                size={18}
                                className="text-slate-400"
                              />

                            </div>

                          </div>
                        ))
                    )}

                  </div>
                </div>

                {/* AI Banner */}
                <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-sm md:flex-row md:items-center md:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                      🤖
                    </div>

                    <div>

                      <h3 className="font-bold">
                        AI Ticket Analysis
                      </h3>

                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                        AI analysis will classify incidents,
                        identify possible causes and suggest
                        troubleshooting steps.
                      </p>

                    </div>

                  </div>

                  <span className="shrink-0 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white">
                    Coming Next ✨
                  </span>

                </div>

              </div>
            )}

            {/* =================================
                TICKETS PAGE
            ================================== */}

            {activePage === "tickets" && (
              <div className="p-6 lg:p-8">

                {/* Page Header */}
                <div className="mb-7">

                  <h3 className="text-2xl font-bold tracking-tight">
                    All Tickets
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    View and manage all support incidents.
                  </p>

                </div>

                {/* Search */}
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

                  <Search
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Search by title, ticket ID, category, priority..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X size={17} />
                    </button>
                  )}

                </div>

                {/* Ticket Card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  {/* Table Header */}
                  <div className="hidden grid-cols-6 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid">

                    <span>Ticket</span>

                    <span className="col-span-2">
                      Issue
                    </span>

                    <span>
                      Category
                    </span>

                    <span>
                      Priority
                    </span>

                    <span>
                      Status
                    </span>

                  </div>

                  {/* Loading */}
                  {ticketsLoading ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                      Loading tickets...
                    </div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="p-10 text-center">

                      <div className="text-3xl">
                        🎫
                      </div>

                      <p className="mt-3 font-semibold text-slate-700">
                        No tickets found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try another search or create a new ticket.
                      </p>

                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">

                      {filteredTickets.map((ticket) => (
                       <div
  key={ticket._id}
  onClick={() => setSelectedTicket(ticket)}
  className="grid cursor-pointer gap-4 px-5 py-5 transition hover:bg-slate-50 md:grid-cols-6 md:items-center"
>

                          {/* Ticket ID */}
                          <div>

                            <span className="text-xs font-bold text-slate-500">
                              {ticket.ticketId}
                            </span>

                            <p className="mt-1 text-xs text-slate-400">
                              {ticket.createdAt
                                ? new Date(
                                    ticket.createdAt
                                  ).toLocaleDateString()
                                : "-"}
                            </p>

                          </div>

                          {/* Issue */}
                          <div className="md:col-span-2">

                            <p className="text-sm font-semibold text-slate-800">
                              {ticket.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {ticket.description}
                            </p>

                          </div>

                          {/* Category */}
                          <div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {ticket.category}
                            </span>

                          </div>

                          {/* Priority */}
                          <div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                                ticket.priority
                              )}`}
                            >
                              {ticket.priority}
                            </span>

                          </div>

                          {/* Status */}
                          <div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                ticket.status
                              )}`}
                            >
                              {ticket.status}
                            </span>

                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}

export default App;