export interface ChartData {
  month: string;
  leads: number;
}

export interface RecentLead {
  leadId: string;
  leadName: string;
  type: string;
  createdDate: string;
  status: string;
}

export interface LeadChartProps {
  data: ChartData[];
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}

export interface MonthlyLeadResponse {
  success: boolean;
  data: {
    month: string;
    count: number;
  }[];
  total?: number;
}
export interface ChartData {
  month: string;
  leads: number;
}

export interface RecentLead {
  leadId: string;
  leadName: string;
  type: string;
  createdDate: string;
  status: string;
}

export interface KPICardProps {
  title: string;
  value: string | number;
}
