/**
 * Debug panel for EmailJS service - Development use only
 */

import React, { useState, useEffect } from 'react';
import { 
  getDebugLogs, 
  clearDebugLogs, 
  debugLogger 
} from '../utils/debugUtils';
import { 
  validateEmailJSConfig, 
  testEmailJSConnectivity, 
  getServiceStatus 
} from '../utils/emailJSValidator';

const EmailDebugPanel = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const [serviceStatus, setServiceStatus] = useState(null);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Load initial logs
    setLogs(getDebugLogs());

    // Update logs every 2 seconds
    const interval = setInterval(() => {
      setLogs(getDebugLogs());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    clearDebugLogs();
    setLogs([]);
  };

  const handleTestConnectivity = async () => {
    debugLogger.info('DEBUG_PANEL', 'Manual connectivity test initiated');
    const result = await testEmailJSConnectivity();
    alert(result.success ? 'Connectivity test passed!' : 'Connectivity test failed!');
  };

  const handleGetServiceStatus = () => {
    const status = getServiceStatus();
    setServiceStatus(status);
    debugLogger.info('DEBUG_PANEL', 'Service status requested', status);
  };

  const handleValidateConfig = () => {
    const validation = validateEmailJSConfig();
    alert(validation.isValid ? 'Configuration is valid!' : `Configuration errors: ${validation.errors.join(', ')}`);
  };

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        {isVisible ? 'Hide' : 'Show'} Email Debug
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          width: '600px',
          maxHeight: '500px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>EmailJS Debug Panel</h3>
          
          {/* Tabs */}
          <div style={{ marginBottom: '15px' }}>
            {['logs', 'status', 'actions'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  backgroundColor: activeTab === tab ? '#555' : '#333',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  marginRight: '5px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <button
                  onClick={handleClearLogs}
                  style={{
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Logs
                </button>
                <span style={{ marginLeft: '10px' }}>
                  {logs.length} log entries
                </span>
              </div>
              
              <div style={{ 
                maxHeight: '300px', 
                overflow: 'auto',
                backgroundColor: '#111',
                padding: '10px',
                borderRadius: '5px'
              }}>
                {logs.length === 0 ? (
                  <div>No logs available</div>
                ) : (
                  logs.slice(-20).reverse().map((log, index) => (
                    <div key={index} style={{ 
                      marginBottom: '8px',
                      padding: '5px',
                      backgroundColor: getLogColor(log.level),
                      borderRadius: '3px'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>
                        [{log.level}] {log.category} - {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div>{log.message}</div>
                      {log.data && (
                        <details style={{ marginTop: '5px' }}>
                          <summary style={{ cursor: 'pointer' }}>Data</summary>
                          <pre style={{ 
                            fontSize: '10px', 
                            overflow: 'auto',
                            backgroundColor: '#000',
                            padding: '5px',
                            borderRadius: '3px',
                            marginTop: '5px'
                          }}>
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Status Tab */}
          {activeTab === 'status' && (
            <div>
              <button
                onClick={handleGetServiceStatus}
                style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                Refresh Status
              </button>
              
              {serviceStatus && (
                <div style={{ 
                  backgroundColor: '#111',
                  padding: '10px',
                  borderRadius: '5px'
                }}>
                  <pre style={{ fontSize: '11px', overflow: 'auto' }}>
                    {JSON.stringify(serviceStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleValidateConfig}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Validate Configuration
                </button>
                
                <button
                  onClick={handleTestConnectivity}
                  style={{
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Test Connectivity
                </button>
                
                <button
                  onClick={() => {
                    console.log('EmailJS Debug Logs:', getDebugLogs());
                    alert('Debug logs printed to console');
                  }}
                  style={{
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Export Logs to Console
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get log color based on level
const getLogColor = (level) => {
  const colors = {
    INFO: 'rgba(33, 150, 243, 0.2)',
    WARN: 'rgba(255, 152, 0, 0.2)',
    ERROR: 'rgba(244, 67, 54, 0.2)',
    DEBUG: 'rgba(76, 175, 80, 0.2)'
  };
  return colors[level] || 'rgba(128, 128, 128, 0.2)';
};

export default EmailDebugPanel;