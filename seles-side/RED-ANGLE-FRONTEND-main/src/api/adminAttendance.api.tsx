import apiClient from "../Services/apiClient";

export const AdminAttendanceAPI = {
  getMyAttendance(p0: number, from?: string, to?: string) {
    return apiClient.get("/admin-attendance/me", {
      params: { from, to },
    });
  },

  checkIn(timestamp?: string) {
    return apiClient.post("/admin-attendance/checkin", {
      timestamp,
    });
  },

  checkOut(timestamp?: string) {
    return apiClient.post("/admin-attendance/checkout", {
      timestamp,
    });
  },

  download(from: string, to: string) {
    return apiClient.get("/admin-attendance/me/download", {
      params: { from, to },
      responseType: "blob",
    });
  },
};
