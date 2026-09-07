import React from "react";



export type LeaveStatus = "Approved" | "Pending" | "Rejected";

interface Leave {
  id: number | string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  noOfDays: number;
  status: LeaveStatus;
}

interface Props {
  data: Leave[];
}


const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB");

const StatusBadge = ({ status }: { status: LeaveStatus }) => {
  const styles = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${styles[status]}`}>
      {status}
    </span>
  );
};


const LeaveHistoryTable: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-center py-10 text-gray-500">
        No leave records found
      </p>
    );
  }

  return (
    <div className="border rounded-2xl overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left">Type</th>
            <th className="px-6 py-3 text-left">From</th>
            <th className="px-6 py-3 text-left">To</th>
            <th className="px-6 py-3 text-center">Days</th>
            <th className="px-6 py-3 text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="px-6 py-4">{l.leaveType}</td>
              <td className="px-6 py-4">{formatDate(l.fromDate)}</td>
              <td className="px-6 py-4">{formatDate(l.toDate)}</td>
              <td className="px-6 py-4 text-center">{l.noOfDays}</td>
              <td className="px-6 py-4 text-center">
                <StatusBadge status={l.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveHistoryTable;