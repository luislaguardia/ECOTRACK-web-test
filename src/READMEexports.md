#  Barrel Exports in This React Project

This React project uses **barrel exports** via `Export.js` files to simplify and organize imports across the frontend codebase.

---

##  What Are Barrel Exports?

Barrel exports allow multiple components to be exported from a single file. This helps avoid long and repetitive import statements across your app.

---

##  Where They're Used

### `components/Export.js`
```js
export { default as Sidebar } from './Sidebar';
```

### `pages/Export.js`
```js
export { default as Users } from './Users';
export { default as Forbidden } from './Forbidden';
export { default as Dashboard } from './Dashboard';
export { default as Login } from './Login';
export { default as News } from './News';
export { default as Settings } from './Settings';
export { default as AdminManagement } from './AdminManagement';
```

---

##  Usage Example (in App.jsx)

Instead of:
```js
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
```

You can now use:
```js
import { Sidebar } from './components/Export';
import { Dashboard, Login, Users } from './pages/Export';
```

---

##  Important

Make sure every component/page being exported has a **default export**:
```js
const Dashboard = () => { return <div>Dashboard</div>; };
export default Dashboard;
```

---

##  Benefits

- Clean and consistent import statements
- Easier file and component management
- Better scalability and maintenance
- Teams can navigate the codebase faster

---

To update or regenerate the `Export.js` files, simply add or remove component exports as needed.
