import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Table, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

interface SalaryData {
  work_year: string;
  job_title: string;  
  salary_in_usd: string;
}

interface AggregatedData {
  year: string;
  total_jobs: number;
  average_salary: number;
}

const SalaryTable: React.FC = () => {
  const [data, setData] = useState<AggregatedData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<any[]>([]);

  // Fetch and parse CSV data
  useEffect(() => {
    fetch('/salaries.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true, 
          complete: (results) => {
            const rawData: SalaryData[] = results.data as SalaryData[];

          
            const yearMap: { [key: string]: { total_jobs: number, total_salary: number } } = {};

            rawData.forEach((item) => {
              const year = item.work_year;
              const salary = parseFloat(item.salary_in_usd);

              if (!yearMap[year]) {
                yearMap[year] = { total_jobs: 0, total_salary: 0 };
              }

              yearMap[year].total_jobs += 1;
              yearMap[year].total_salary += salary;
            });

            const aggregatedData = Object.keys(yearMap).map(year => ({
              year,
              total_jobs: yearMap[year].total_jobs,
              average_salary: yearMap[year].total_salary / yearMap[year].total_jobs,
            }));

            console.log('Aggregated Data:', aggregatedData); // Log to verify
            setData(aggregatedData);
          },
        });
      });
  }, []);

  const columns = [
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      sorter: (a: AggregatedData, b: AggregatedData) => parseInt(a.year) - parseInt(b.year),
    },
    {
      title: 'Total Jobs',
      dataIndex: 'total_jobs',
      key: 'total_jobs',
      sorter: (a: AggregatedData, b: AggregatedData) => a.total_jobs - b.total_jobs,
    },
    {
      title: 'Average Salary (USD)',
      dataIndex: 'average_salary',
      key: 'average_salary',
      render: (salary: number) => salary.toFixed(2),  // Format to 2 decimal places
      sorter: (a: AggregatedData, b: AggregatedData) => a.average_salary - b.average_salary,
    },
  ];

 
  const handleRowClick = (record: AggregatedData) => {
    setSelectedYear(record.year);
    const filteredData = data.filter(item => item.year === record.year);
    const jobTitleCount = filteredData.reduce((acc: any, job: any) => {
      acc[job.job_title] = (acc[job.job_title] || 0) + 1;
      return acc;
    }, {});
    setJobDetails(Object.entries(jobTitleCount).map(([title, count]) => ({ title, count })));
  };

 
  const jobColumns = [
    { title: 'Job Title', dataIndex: 'title', key: 'title' },
    { title: 'Number of Jobs', dataIndex: 'count', key: 'count' },
  ];

  return (
    <div>
    {/* Main Title */}
   

    {/* Container for the table and chart */}
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {/* Main Table with salary data */}
      <div style={{ width: '50%', paddingRight: '10px' }}>
      <Title level={3}>ML Engineer Salaries</Title>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="year"
          onRow={(record) => ({
            onClick: () => setSelectedYear(record.year),
          })}
        />
      </div>

      {/* Line Chart to show job trends */}
      <div style={{ width: '50%', paddingLeft: '10px' }}>
        <Title level={4}>Job Trends (2020 - 2024)</Title>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={data} margin={{ top: 40, right: 20, bottom: 20, left: 20 }} style={{ backgroundColor: 'darkblue' }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke="yellow" />
            <YAxis stroke="yellow" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total_jobs" stroke="red" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Secondary Table showing job titles for selected year */}
    {selectedYear && (
      <>
        <Title level={4}>Job Titles for {selectedYear}</Title>
        <Table dataSource={jobDetails} columns={[{ title: 'Job Title', dataIndex: 'title', key: 'title' }, { title: 'Number of Jobs', dataIndex: 'count', key: 'count' }]} rowKey="title" />
      </>
    )}
  </div>
  );
};

export default SalaryTable;
