const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const routesInfo = [];

const routesDir = __dirname + '/routes/';

if (fs.existsSync(routesDir)) {
  fs.readdirSync(routesDir).forEach(file => {
    if (file === 'getRoutes.js') return;
    
    if (file.endsWith('.js')) {
      const routeName = file.replace('.js', '').toLowerCase();
      const routePath = path.join(routesDir, file);
      const routeModule = require(routePath);
      
      router.use(`/${routeName}`, routeModule);
      
      const fileContent = fs.readFileSync(routePath, 'utf8');
      const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
      
      let match;
      while ((match = routeRegex.exec(fileContent)) !== null) {
        const method = match[1].toUpperCase();
        const endpointPath = match[2];
        
        routesInfo.push({
          path: `/api/${routeName}${endpointPath}`,
          methods: [method]
        });
      }
    }
  });
}

module.exports = {
  router,
  routes: routesInfo
};