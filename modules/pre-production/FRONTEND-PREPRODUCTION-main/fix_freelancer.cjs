const fs = require('fs');
const file = 'src/pages/data-manager/pages/RawDataView.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace parseFreelancer definition
const parseFreelancerRegex = /    const parseFreelancer = \(entry: string\) => \{[\s\S]*?    \};\n/;

const parseFreelancerReplacement = `    const parseStaffEntry = (entry: string) => {
        let displayName = entry;
        let phone = '';
        const rawNamePart = entry.includes('::') ? entry.split('::')[0] : entry;
        
        if (rawNamePart.startsWith('FREELANCE_')) {
            const withoutPrefix = rawNamePart.replace('FREELANCE_', '');
            const parts = withoutPrefix.split('_');
            if (parts.length > 1 && /^\\d+$/.test(parts[parts.length - 1])) {
                phone = parts.pop() || '';
            }
            displayName = parts.join(' ');
        } else {
            displayName = rawNamePart;
        }

        let typeLabel = 'Staff';
        if (rawNamePart.startsWith('FREELANCE_')) {
            typeLabel = 'Freelancer';
        } else if (rawNamePart.startsWith('EMP-')) {
            typeLabel = 'Internal Shooter';
        }

        return { displayName, phone, typeLabel };
    };\n`;

content = content.replace(parseFreelancerRegex, parseFreelancerReplacement);

// 2. Replace all the 5 rendering blocks
const arrays = ['photographerStaff', 'secondaryPhotographerStaff', 'videographerStaff', 'secondaryVideographerStaff', 'droneStaff'];

arrays.forEach(arrName => {
    const targetBlockRegex = new RegExp(
        \`                                {\\$\\{arrName\\}.length > 0 && \\([\\\\s\\\\S]*?<div className="text-\\\\[10px\\\\] font-bold text-gray-400 uppercase tracking-widest mb-2">Freelancer</div>[\\\\s\\\\S]*?                                \\)}\`
    );

    const replacementBlock = \`                                {$\{arrName}.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <div className="flex flex-col gap-2">
                                            {$\{arrName}.map((entry: string, i: number) => {
                                                const { displayName, phone, typeLabel } = parseStaffEntry(entry);
                                                return (
                                                    <div key={i} className="flex flex-col p-2.5 bg-blue-50 rounded-lg border border-blue-100/60">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{typeLabel}</div>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Name</div>
                                                                <div className="text-xs font-bold text-blue-900 capitalize leading-none">{displayName}</div>
                                                            </div>
                                                            {phone && (
                                                                <div className="text-right">
                                                                    <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Mobile Number</div>
                                                                    <div className="text-xs font-bold text-blue-900 leading-none">{phone}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}\`;

    content = content.replace(targetBlockRegex, replacementBlock);
});

fs.writeFileSync(file, content);
console.log('Done replacement!');
