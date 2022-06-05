import React from 'react';
import ReactDOM from 'react-dom/client';

// Components
import App from './App';

// Styles
import './css/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
library.add(fas, far, fab);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);