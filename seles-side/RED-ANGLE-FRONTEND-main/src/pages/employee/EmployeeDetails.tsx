// src/pages/employee/EmployeeDetails.tsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import apiClient from "../../Services/apiClient";
import { tokenService } from "../../Services/tokenService";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

interface EmployeeProfile {
  employeeId: number;
  firstName: string;
  lastName: string;
  position?: string;
  dateOfJoin?: string;
  contactNumber?: string;
  workLocation?: string;
  user?: {
    email: string;
    role: string;
  };
  profileImagePath?: string;
}

interface AssignedTask {
  taskId: number;
  taskName: string;
  status: string;
  priority: string;
  dueDate: string;
  estimatedDuration: number;
  lead: {
    leadId: number;
    leadSerialNumber?: string;
    leadType?: string;
    firstName: string;
    lastName: string;
    currentStage: string;
    eventDate?: string;
    weddingDate?: string;
    receptionDate?: string;
  };
  assignedBy?: {
    email: string;
  };
}

interface Leave {
  leaveType: string;
  noOfDays: number;
  status: string;
}

interface AttendanceReport {
  presentCount: number;
  absentCount: number;
  date: string;
}


/* ================= COMPONENT ================= */

const EmployeeDetails: React.FC = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [attendance, setAttendance] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);



  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await apiClient.get("/employees/self");
        const profileData =
          profileRes.data?.profile ?? profileRes.data?.data;

        setProfile(profileData);
        tokenService.setEmployeeId(String(profileData.employeeId));

        const taskRes = await apiClient.get("/leads/tasks/my");
        setTasks(taskRes.data?.data ?? []);

        const leaveRes = await apiClient.get("/employees/leave", {
          params: { page: 0, limit: 3 },
        });
        setLeaves(leaveRes.data?.leaves?.leaves ?? []);

        const attendanceRes = await apiClient.get(
          "/employees/report/daily"
        );
        setAttendance(attendanceRes.data?.report ?? null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading || !profile) {
    return (
      <div className="flex h-screen">
        <Sidebar forceOpen />
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading profile…
        </div>
      </div>
    );
  }

  const profileImageUrl = profile?.profileImagePath
    ? profile.profileImagePath.startsWith("http") || profile.profileImagePath.startsWith("data:")
      ? profile.profileImagePath
      : `${import.meta.env.VITE_API_URL}${profile.profileImagePath.startsWith("/") ? "" : "/"}${profile.profileImagePath}`
    : null;




  const initials =
    profile.firstName[0].toUpperCase() +
    profile.lastName[0].toUpperCase();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar forceOpen />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* ================= PROFILE HEADER ================= */}
            <section className="bg-white rounded-2xl border p-6 flex items-center justify-between">
              <div className="flex gap-5 items-start">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover block"
                    />
                  ) : (
                    <span className="flex items-center justify-center h-full w-full text-white bg-indigo-600 text-xl font-semibold">
                      {initials}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {profile.position}
                  </p>
                  <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                Edit Profile
              </button>
            </section>

            {/* ================= INFO GRID ================= */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoCard label="Employee ID" value={`EMP - ${profile.employeeId}`} />
              <InfoCard label="Email" value={profile.user?.email} />
              <InfoCard label="Role" value={profile.user?.role} />
              <InfoCard
                label="Joined Date"
                value={profile.dateOfJoin?.split("T")[0]}
              />
            </section>

            {/* ================= ATTENDANCE ================= */}
            {attendance && (
              <section className="bg-white rounded-2xl border p-6">
                <h2 className="text-base font-semibold mb-5">
                  Attendance Overview
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  {/* Date Card */}
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Date
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {attendance.date}
                    </p>
                  </div>

                  {/* Present Card */}
                  <div className="rounded-xl border bg-green-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-green-700">
                      Present
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-green-700">
                      {attendance.presentCount}
                    </p>
                  </div>

                  {/* Absent Card */}
                  <div className="rounded-xl border bg-red-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-red-700">
                      Absent
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-red-700">
                      {attendance.absentCount}
                    </p>
                  </div>

                </div>
              </section>
            )}


            {/* ================= ASSIGNED LEADS ================= */}
            <section className="bg-white rounded-2xl border p-6">
              <h2 className="text-base font-semibold mb-4">
                Assigned Leads
              </h2>

              {tasks.length === 0 ? (
                <p className="text-sm text-gray-500">No leads assigned</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-3 py-3 text-left">Lead ID</th>
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
                      {tasks.slice(0, 5).map((task) => (
                        <tr
                          key={task.taskId}
                          className="border-b last:border-none hover:bg-gray-50 transition"
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5 font-medium">
                              <span>{task.lead.leadSerialNumber || task.lead.leadId}</span>
                              {task.lead.leadType && (
                                <span
                                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    task.lead.leadType === "RAS"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {task.lead.leadType}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 font-medium">
                            {task.lead.firstName} {task.lead.lastName}
                          </td>
                          <td className="px-3">{task.taskName}</td>
                          <td className="px-3"><Badge text={task.lead.currentStage} /></td>
                          <td className="px-3"><Badge text={task.status} /></td>
                          <td className="px-3"><PriorityBadge priority={task.priority} /></td>
                          <td className="px-3">
                            {(() => {
                              const raw =
                                task.dueDate ||
                                task.lead?.eventDate ||
                                task.lead?.weddingDate ||
                                task.lead?.receptionDate;
                              if (!raw) return "—";
                              const d = new Date(raw);
                              return !isNaN(d.getTime())
                                ? d.toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : typeof raw === "string" && raw.includes("T")
                                ? raw.split("T")[0]
                                : String(raw);
                            })()}
                          </td>
                          <td className="px-3 text-gray-500">
                            {task.assignedBy?.email ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ================= LEAVES ================= */}
            <section className="bg-white rounded-2xl border p-6">
              <h2 className="text-base font-semibold mb-4">
                Recent Leave Requests
              </h2>

              {leaves.length === 0 ? (
                <p className="text-sm text-gray-500">No leave records</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {leaves.map((l, i) => (
                    <li key={i} className="flex justify-between">
                      <span>
                        {l.leaveType} ({l.noOfDays} days)
                      </span>
                      <Badge text={l.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

          </div>
        </main>

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
                if (updated.contactNumber) formData.append("contactNumber", updated.contactNumber);
                if (updated.workLocation) formData.append("workLocation", updated.workLocation);

                if (updated.profileImageFile) {
                  formData.append("profileImage", updated.profileImageFile);
                }

                const res = await apiClient.put(
                  `/employees/${profile.employeeId}`,
                  formData,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );

                setProfile(res.data.data);

                toast.success("Profile updated successfully");

                setIsEditOpen(false);
              } catch (err: any) {
                console.error("Failed to update profile", err);

                if (err.response) {
                  toast.error(err.response.data?.message || "Update failed");
                } else if (err.request) {
                  toast.error("Server not reachable");
                } else {
                  toast.error("Something went wrong");
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

/* ================= UI HELPERS ================= */

const InfoCard = ({ label, value }: { label: string; value?: string }) => (
  <div className="rounded-xl border bg-white p-5">
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-2 text-sm font-medium text-gray-800">{value ?? "—"}</p>
  </div>
);

const Stat = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: "green" | "red";
}) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p
      className={`mt-1 text-xl font-semibold ${highlight === "green"
        ? "text-green-600"
        : highlight === "red"
          ? "text-red-600"
          : ""
        }`}
    >
      {value}
    </p>
  </div>
);

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  return (
    <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${styles[priority] ?? "bg-gray-100 text-gray-700"}`}>
      {priority}
    </span>
  );
};

const Badge = ({ text }: { text: string }) => (
  <span className="px-3 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
    {text}
  </span>
);

/* ================= EDIT MODAL ================= */

const EditProfileModal = ({
  profile,
  onClose,
  onSave,
}: {
  profile: EmployeeProfile;
  onClose: () => void;
  onSave: (updated: Partial<EmployeeProfile> & { profileImageFile?: File }) => void;
}) => {
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    position: profile.position ?? "",
    contactNumber: profile.contactNumber ?? "",
    workLocation: profile.workLocation ?? "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.profileImagePath
      ? profile.profileImagePath.startsWith("http") || profile.profileImagePath.startsWith("data:")
        ? profile.profileImagePath
        : `${import.meta.env.VITE_API_URL}${profile.profileImagePath.startsWith("/") ? "" : "/"}${profile.profileImagePath}`
      : null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      contactNumber: "",
    };

    if (!form.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!form.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!form.contactNumber.trim())
      newErrors.contactNumber = "Contact number is required";

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== "");
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({ ...form, profileImageFile: imageFile ?? undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] rounded-2xl shadow-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>

        {/* PROFILE IMAGE */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setPreviewUrl(null)}
              />
            ) : (
              <span className="text-white bg-indigo-600 w-full h-full flex items-center justify-center text-xl font-semibold">
                {profile.firstName[0]}{profile.lastName[0]}
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

        {/* FORM FIELDS */}
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.firstName}
              onChange={(e) => {
                setForm({ ...form, firstName: e.target.value });
                setErrors({ ...errors, firstName: "" });
              }}
              className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.firstName ? "border-red-500" : ""
                }`}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.lastName}
              onChange={(e) => {
                setForm({ ...form, lastName: e.target.value });
                setErrors({ ...errors, lastName: "" });
              }}
              className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.lastName ? "border-red-500" : ""
                }`}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName}</p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              value={form.contactNumber}
              onChange={(e) => {
                setForm({ ...form, contactNumber: e.target.value });
                setErrors({ ...errors, contactNumber: "" });
              }}
              className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.contactNumber ? "border-red-500" : ""
                }`}
            />
            {errors.contactNumber && (
              <p className="text-xs text-red-500">{errors.contactNumber}</p>
            )}
          </div>

          {/* Optional Fields */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Position</label>
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Work Location</label>
            <input
              value={form.workLocation}
              onChange={(e) => setForm({ ...form, workLocation: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};


export default EmployeeDetails;
