import React, { useState, useEffect } from 'react';
import { 
  getDatabaseTablesInfo, 
  getDatabaseUsersTable, 
  getDatabaseDepartmentsTable, 
  getDatabaseComplaintsTable, 
  getDatabaseStatusesTable,
  getDatabaseTableSchema,
  getComplaints
} from '../services/api';
import { Database as DbIcon, Table, Code, RefreshCw, Server, Layers } from 'lucide-react';

const DatabaseExplorer = () => {
  const [tablesInfo, setTablesInfo] = useState([]);
  const [activeTable, setActiveTable] = useState('users');
  const [tableData, setTableData] = useState([]);
  const [joinedComplaints, setJoinedComplaints] = useState([]);
  const [schemaColumns, setSchemaColumns] = useState([]);
  const [viewMode, setViewMode] = useState('data'); // 'data' | 'schema'
  const [isJoinedView, setIsJoinedView] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadTablesOverview = async () => {
    try {
      const res = await getDatabaseTablesInfo();
      if (res.data.success) {
        setTablesInfo(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tables info:', err);
      setError('Could not connect to Express REST API / PostgreSQL database.');
    }
  };

  const loadSelectedTableData = async (tableName, showJoined = false) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Schema columns metadata
      const schemaRes = await getDatabaseTableSchema(tableName);
      if (schemaRes.data.success) {
        setSchemaColumns(schemaRes.data.columns || []);
      }

      // 2. Fetch raw table records from SQL
      let dataRes;
      if (tableName === 'users') dataRes = await getDatabaseUsersTable();
      else if (tableName === 'departments') dataRes = await getDatabaseDepartmentsTable();
      else if (tableName === 'complaints') {
        dataRes = await getDatabaseComplaintsTable();
        if (showJoined) {
          const joinedRes = await getComplaints();
          setJoinedComplaints(joinedRes.data.data || []);
        }
      }
      else if (tableName === 'statuses') dataRes = await getDatabaseStatusesTable();

      if (dataRes && dataRes.data.success) {
        setTableData(dataRes.data.data || []);
      }
    } catch (err) {
      console.error(`Error loading ${tableName} table data:`, err);
      setError(`Failed to fetch records for table "${tableName}" from PostgreSQL.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTablesOverview();
    loadSelectedTableData(activeTable, isJoinedView);
  }, [activeTable, isJoinedView]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTablesOverview();
    await loadSelectedTableData(activeTable, isJoinedView);
    setIsRefreshing(false);
  };

  const handleSelectTable = (tblName) => {
    setActiveTable(tblName);
    setIsJoinedView(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SQL Database Explorer</h1>
          <p className="page-subtitle">Inspect raw PostgreSQL tables, schema definitions, and live SQL query records</p>
        </div>
        <button 
          className="btn btn-outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spinner' : ''} />
          <span>Refresh Database</span>
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Database Connection Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        color: 'white',
        padding: '20px 24px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server size={24} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>PostgreSQL Database: complaint_management</div>
            <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
              Host: localhost:5432 | Engine: PostgreSQL | Driver: pg (Node.js)
            </div>
          </div>
        </div>
        <div className="db-status-badge">
          <div className="db-status-dot"></div>
          <span>Direct SQL Persistence</span>
        </div>
      </div>

      {/* Selectable Table Cards */}
      <div className="db-selector-grid">
        {tablesInfo.map((tbl) => (
          <div
            key={tbl.table_name}
            className={`db-table-card ${activeTable === tbl.table_name ? 'active' : ''}`}
            onClick={() => handleSelectTable(tbl.table_name)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="db-table-name">
                <Table size={16} style={{ display: 'inline', marginRight: '6px' }} />
                {tbl.table_name}
              </div>
              <span className="badge badge-pending" style={{ fontSize: '0.72rem' }}>
                {tbl.record_count} rows
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              {tbl.description}
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Viewer Card */}
      <div className="card-container">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ fontFamily: 'var(--font-mono)' }}>
              SELECT * FROM {activeTable};
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Fetched {tableData.length} records directly from PostgreSQL
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTable === 'complaints' && viewMode === 'data' && (
              <button
                className={`btn btn-sm ${isJoinedView ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIsJoinedView(!isJoinedView)}
              >
                <Layers size={14} />
                <span>{isJoinedView ? 'Viewing SQL JOINs' : 'View SQL JOINs'}</span>
              </button>
            )}

            <button
              className={`btn btn-sm ${viewMode === 'data' ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setViewMode('data')}
            >
              <Table size={14} />
              <span>Data Records</span>
            </button>

            <button
              className={`btn btn-sm ${viewMode === 'schema' ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setViewMode('schema')}
            >
              <Code size={14} />
              <span>Table Structure / Schema</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="state-container">
            <div className="spinner"></div>
            <div>Executing SQL query on table "{activeTable}"...</div>
          </div>
        ) : viewMode === 'schema' ? (
          /* Table Structure View */
          <div className="table-wrapper">
            <table className="custom-table code-table">
              <thead>
                <tr>
                  <th>Column Name</th>
                  <th>Data Type</th>
                  <th>Max Length</th>
                  <th>Is Nullable?</th>
                  <th>Column Default</th>
                </tr>
              </thead>
              <tbody>
                {schemaColumns.map((col) => (
                  <tr key={col.column_name}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{col.column_name}</td>
                    <td style={{ color: '#0284c7', fontWeight: 600 }}>{col.data_type}</td>
                    <td>{col.character_maximum_length || 'N/A'}</td>
                    <td>
                      <span className={`badge ${col.is_nullable === 'YES' ? 'badge-pending' : 'badge-resolved'}`}>
                        {col.is_nullable}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{col.column_default || 'NULL'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : isJoinedView && activeTable === 'complaints' ? (
          /* Joined View for Complaints */
          <div className="table-wrapper">
            <table className="custom-table code-table">
              <thead>
                <tr>
                  <th>complaint_id</th>
                  <th>user_name (JOIN users)</th>
                  <th>department_name (JOIN departments)</th>
                  <th>category</th>
                  <th>description</th>
                  <th>complaint_state</th>
                  <th>created_at</th>
                </tr>
              </thead>
              <tbody>
                {joinedComplaints.map((row) => (
                  <tr key={row.complaint_id}>
                    <td>{row.complaint_id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{row.user_name}</td>
                    <td>{row.department_name}</td>
                    <td>{row.category}</td>
                    <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.description}
                    </td>
                    <td>{row.complaint_state}</td>
                    <td>{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Raw SQL Records View */
          <div className="table-wrapper">
            {tableData.length === 0 ? (
              <div className="state-container">
                <div>No records found in table "{activeTable}".</div>
              </div>
            ) : (
              <table className="custom-table code-table">
                <thead>
                  <tr>
                    {Object.keys(tableData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.entries(row).map(([k, val], i) => (
                        <td key={i}>
                          {val === null || val === undefined ? (
                            <span style={{ color: '#94a3b8', italic: true }}>NULL</span>
                          ) : typeof val === 'object' ? (
                            JSON.stringify(val)
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseExplorer;
