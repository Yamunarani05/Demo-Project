const fs = require('fs');
const content = fs.readFileSync('src/index.ts', 'utf16le');
let newContent = content.replace(
    'import pixofficeRoutes from "./routes/pixoffice.routes";', 
    'import pixofficeRoutes from "./routes/pixoffice.routes";\nimport pixstudioRoutes from "./routes/pixstudio.routes";'
);
newContent = newContent.replace(
    'app.use("/api/pixoffice", pixofficeRoutes);', 
    'app.use("/api/pixoffice", pixofficeRoutes);\napp.use("/api/pixstudio", pixstudioRoutes);'
);
fs.writeFileSync('src/index.ts', newContent, 'utf16le');
console.log('Done');
