import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export type BreadcrumbItem = {
    label: string;
    link?: string;
};

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    homeLink?: string;
}

export default function Breadcrumb({ items, homeLink = "/" }: BreadcrumbProps) {
    return (
        <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-5 font-medium tracking-wide">
            <Link to={homeLink} className="hover:text-purple-600 transition-colors flex items-center gap-1 bg-white p-1.5 rounded-md shadow-sm border border-gray-100">
                <Home size={14} className="mb-[1px]" />
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-gray-300" />
                    {item.link ? (
                        <Link to={item.link} className="hover:text-purple-600 transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-semibold">{item.label}</span>
                    )}
                </div>
            ))}
        </div>
    );
}
