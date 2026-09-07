const fs = require('fs');
const file = 'src/pages/data-manager/pages/RawDataView.tsx';
let content = fs.readFileSync(file, 'utf8');

const arrays = ['photographerStaff', 'secondaryPhotographerStaff', 'videographerStaff', 'secondaryVideographerStaff', 'droneStaff'];

arrays.forEach(arrName => {
    // We use a regex to match the exact block.
    // The indentation is flexible.
    const regex = new RegExp(
        \`({\\s*\\$\\{arrName\\}\\.length > 0 && \\(\\s*<div className="mt-2 pt-2 border-t border-gray-200">\\s*)<div className="text-\\\\[10px\\\\] font-bold text-gray-400 uppercase tracking-widest mb-2">Freelancer</div>(\\s*<div className="flex flex-col gap-2">\\s*\\{\\$\\{arrName\\}\\.map\\(\\(entry: string, i: number\\) => \\{\\s*)const \\{ displayName, phone \\} = parseFreelancer\\(entry\\);(\\s*return \\(\\s*)<div key=\\{i\\} className="flex items-center justify-between p-2\\.5 bg-blue-50 rounded-lg border border-blue-100/60">(\\s*<div>\\s*<div className="text-\\\\[9px\\\\] font-bold text-blue-400 uppercase tracking-wider mb-0\\.5">Name</div>\\s*<div className="text-xs font-bold text-blue-900 capitalize leading-none">\\{displayName\\}</div>\\s*</div>)\`, 'g'
    );

    content = content.replace(regex, (match, p1, p2, p3, p4) => {
        return \`\${p1}\${p2}const { displayName, phone, typeLabel } = parseStaffEntry(entry);\${p3}<div key={i} className="flex flex-col p-2.5 bg-blue-50 rounded-lg border border-blue-100/60">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{typeLabel}</div>
                                                        <div className="flex items-center justify-between">\${p4}\`;
    });
});

fs.writeFileSync(file, content);
console.log('Done rendering blocks replacement!');
