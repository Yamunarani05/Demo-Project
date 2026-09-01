// src/pages/partner/Profile.tsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import apiClient from "../../Services/apiClient";
import toast from "react-hot-toast";
import type { PartnerAssignedTask } from "../../api/leads.api";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ================= TYPES ================= */
interface User {
  userId: number;
  email?: string;
  role?: string;
}

interface PartnerProfile {
  employeeId: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  dob?: string;
  workLocation?: string;
  position?: string;
  profileImagePath?: string;
  user?: User;
}

interface PartnerEarning {
  leadName: string;
  projectValue: number;
  earning: number;
  status: string;
}

/* ================= HELPERS ================= */
const formatDateToReadable = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const InfoCard = ({ label, value }: { label: string; value?: string }) => (
  <div className="rounded-xl border bg-white p-5">
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-2 text-sm font-medium text-gray-800">{value ?? "—"}</p>
  </div>
);

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`px-3 py-0.5 rounded-full text-xs font-medium ${
        styles[priority] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {priority}
    </span>
  );
};

const getStatusBadgeStyle = (status?: string) => {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-700";
    case "Unpaid":
      return "bg-rose-100 text-rose-700";
    case "Pending":
      return "bg-amber-100 text-amber-700";
    case "To Do":
      return "bg-gray-100 text-gray-700";
    case "In Progress":
      return "bg-blue-100 text-blue-700";
    case "In Review":
      return "bg-yellow-100 text-yellow-700";
    case "Done":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const StatusBadge = ({ status }: { status?: string }) => (
  <span
    className={`px-3 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(
      status
    )}`}
  >
    {status ?? "—"}
  </span>
);

const ITEMS_PER_PAGE = 5;
const paginate = <T,>(items: T[], currentPage: number) => {
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = items.slice(start, start + ITEMS_PER_PAGE);
  return { paginated, totalPages };
};

/* ================= COMPONENT ================= */
const Profile: React.FC = () => {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [tasks, setTasks] = useState<PartnerAssignedTask[]>([]);
  const [earnings, setEarnings] = useState<PartnerEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Pagination state
  const [tasksPage, setTasksPage] = useState(1);
  const [earningsPage, setEarningsPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        // PROFILE
        const profileRes = await apiClient.get("/employees/profile");
        const profileData = profileRes.data?.profile ?? null;
        setProfile(profileData);

        // TASKS
        const tasksRes = await apiClient.get("/leads/tasks/partner/my");
        setTasks(tasksRes.data?.data ?? []);

        // EARNINGS
        const earningsRes = await apiClient.get("/leads/earnings");
        setEarnings(earningsRes.data?.results ?? []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !profile) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading profile…
        </div>
      </div>
    );
  }

  const initials = (
    (profile.firstName?.[0] ?? "P") + (profile.lastName?.[0] ?? "P")
  ).toUpperCase();

  const profileImageUrl = profile.profileImagePath
    ? profile.profileImagePath.startsWith("http") || profile.profileImagePath.startsWith("data:")
      ? profile.profileImagePath
      : `${import.meta.env.VITE_API_URL}${
          profile.profileImagePath.startsWith("/") ? "" : "/"
        }${profile.profileImagePath}`
    : null;

  const totalEarnings = earnings.reduce((sum, e) => sum + (e.earning || 0), 0);

  const { paginated: paginatedTasks, totalPages: tasksTotalPages } = paginate(
    tasks,
    tasksPage
  );
  const { paginated: paginatedEarnings, totalPages: earningsTotalPages } =
    paginate(earnings, earningsPage);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* PROFILE HEADER */}
            <section className="bg-white rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-4 sm:gap-5 items-start">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover block"
                    />
                  ) : (
                    <span className="flex items-center justify-center h-full w-full text-white bg-indigo-600 text-lg sm:text-xl font-semibold">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="text-lg font-semibold truncate">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-sm text-gray-500 truncate">
                    {profile.position ?? "Partner"}
                  </p>
                  <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium border border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                Edit Profile
              </button>
            </section>

            {/* INFO GRID */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <InfoCard label="Employee ID" value={`EMP - ${profile.employeeId}`} />
              <InfoCard label="Email" value={profile.user?.email ?? "—"} />
              <InfoCard label="Role" value={profile.user?.role ?? "Partner"} />
              <InfoCard label="Work Location" value={profile.workLocation ?? "—"} />
            </section>

            {/* ASSIGNED LEADS */}
            <section className="bg-white rounded-2xl border p-5 sm:p-6">
              <h2 className="text-base font-semibold mb-4">Assigned Leads</h2>
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-500">No leads assigned</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-3 py-3 text-left">Client</th>
                        <th className="px-3 text-left">Task</th>
                        <th className="px-3 text-left">Stage</th>
                        <th className="px-3 text-left">Status</th>
                        <th className="px-3 text-left">Priority</th>
                        <th className="px-3 text-left">Due Date</th>
                        <th className="px-3 text-left">Assigned By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTasks.map((task) => (
                        <tr
                          key={task.taskId}
                          className="border-b last:border-none hover:bg-gray-50 transition"
                        >
                          <td className="px-3 py-3 font-medium">
                            {task.lead?.leadName ?? "—"}
                          </td>
                          <td className="px-3">{task.taskName ?? "—"}</td>
                          <td className="px-3">
                            <StatusBadge status={task.lead?.currentStage} />
                          </td>
                          <td className="px-3">
                            <StatusBadge status={task.lead?.status} />
                          </td>
                          <td className="px-3">
                            <PriorityBadge priority={task.priority ?? "—"} />
                          </td>
                          <td className="px-3">{formatDateToReadable(task.dueDate)}</td>
                          <td className="px-3 text-gray-500">
                            {task.assignedBy?.email ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* TASKS PAGINATION */}
                  <div className="flex justify-end items-center gap-2 mt-2 text-sm">
                    <button
                      disabled={tasksPage === 1}
                      onClick={() => setTasksPage(tasksPage - 1)}
                      className="px-2 py-1 rounded-lg border border-gray-300 disabled:opacity-50 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      {tasksPage} / {tasksTotalPages}
                    </span>
                    <button
                      disabled={tasksPage === tasksTotalPages}
                      onClick={() => setTasksPage(tasksPage + 1)}
                      className="px-2 py-1 rounded-lg border border-gray-300 disabled:opacity-50 flex items-center gap-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* EARNINGS */}
            <section className="bg-white rounded-2xl border p-5 sm:p-6">
              <h2 className="text-base font-semibold mb-2">Earnings</h2>
              <p className="text-sm mb-4">
                Total Earnings: <b>₹{totalEarnings}</b>
              </p>

              {earnings.length === 0 ? (
                <p className="text-sm text-gray-500">No earnings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left">Lead</th>
                        <th className="px-3 text-left">Project Value</th>
                        <th className="px-3 text-left">Earning</th>
                        <th className="px-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEarnings.map((e, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2">{e.leadName}</td>
                          <td className="px-3">₹{e.projectValue}</td>
                          <td className="px-3">₹{e.earning}</td>
                          <td className="px-3">
                            <StatusBadge status={e.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* EARNINGS PAGINATION */}
                  <div className="flex justify-end items-center gap-2 mt-2 text-sm">
                    <button
                      disabled={earningsPage === 1}
                      onClick={() => setEarningsPage(earningsPage - 1)}
                      className="px-2 py-1 rounded-lg border border-gray-300 disabled:opacity-50 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      {earningsPage} / {earningsTotalPages}
                    </span>
                    <button
                      disabled={earningsPage === earningsTotalPages}
                      onClick={() => setEarningsPage(earningsPage + 1)}
                      className="px-2 py-1 rounded-lg border border-gray-300 disabled:opacity-50 flex items-center gap-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>

        {/* EDIT PROFILE MODAL */}
        {isEditOpen && profile && (
          <EditProfileModal
            profile={profile}
            onClose={() => setIsEditOpen(false)}
            onSave={async (updated) => {
              try {
                const formData = new FormData();
                if (updated.firstName) formData.append("firstName", updated.firstName);
                if (updated.lastName) formData.append("lastName", updated.lastName);
                if (updated.position) formData.append("position", updated.position);
                if (updated.contactNumber)
                  formData.append("contactNumber", updated.contactNumber);
                if (updated.workLocation)
                  formData.append("workLocation", updated.workLocation);
                if (updated.profileImageFile)
                  formData.append("profileImage", updated.profileImageFile);

                const res = await apiClient.put(
                  `/employees/${profile.employeeId}`,
                  formData,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );

                setProfile(res.data.data);
                toast.success("Profile updated successfully");
                setIsEditOpen(false);
              } catch (err: any) {
                console.error(err);
                toast.error(err.response?.data?.message || "Update failed");
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

/* ================= EDIT PROFILE MODAL ================= */
const EditProfileModal = ({
  profile,
  onClose,
  onSave,
}: {
  profile: PartnerProfile;
  onClose: () => void;
  onSave: (updated: Partial<PartnerProfile> & { profileImageFile?: File }) => void;
}) => {
  const [form, setForm] = useState({
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    position: profile.position ?? "",
    contactNumber: profile.contactNumber ?? "",
    workLocation: profile.workLocation ?? "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.profileImagePath
      ? profile.profileImagePath.startsWith("http") || profile.profileImagePath.startsWith("data:")
        ? profile.profileImagePath
        : `${import.meta.env.VITE_API_URL}${
            profile.profileImagePath.startsWith("/") ? "" : "/"
          }${profile.profileImagePath}`
      : null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
      <div className="bg-white w-[520px] max-w-full rounded-2xl shadow-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white bg-indigo-600 w-full h-full flex items-center justify-center text-xl font-semibold">
                {profile.firstName?.[0] ?? ""}{profile.lastName?.[0] ?? ""}
              </span>
            )}
          </div>
          <div>
            <label className="cursor-pointer px-3 py-1 border rounded-lg bg-gray-100 text-sm text-gray-700 hover:bg-gray-200">
              Change Image
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {imageFile && <p className="text-xs mt-1 text-gray-500">{imageFile.name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(form).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1 capitalize">{key}</label>
              <input
                name={key}
                value={value as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...form, profileImageFile: imageFile ?? undefined })}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
