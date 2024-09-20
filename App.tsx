
import React from 'react';
import 'antd/dist/reset.css';  
import SalaryTable from './components/SalaryTable';  
import './index.css'

const App: React.FC = () => {
  return (
    <div className="App">
      <SalaryTable />
    </div>
  );
};

export default App;
