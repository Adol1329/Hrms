import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaUser, FaBuilding, FaFileContract, FaBriefcase } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const response = await axiosInstance.get(`/api/search/global?query=${encodeURIComponent(query)}&page=0&size=5`);
          console.log('Search response:', response.data); // Debug log
          
          // Extract content from paginated results
          const formattedResults = {
            employees: response.data.employees?.content || [],
            departments: response.data.departments?.content || [],
            contracts: response.data.contracts?.content || [],
            positions: response.data.positions?.content || []
          };
          
          setResults(formattedResults);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults({
            employees: [],
            departments: [],
            contracts: [],
            positions: []
          });
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleResultClick = (type, item) => {
    setShowResults(false);
    setQuery('');
    
    switch (type) {
      case 'employees':
        navigate(`/admin/employees?id=${item.empId}`);
        break;
      case 'departments':
        navigate(`/admin/departments?id=${item.departmentId}`);
        break;
      case 'contracts':
        navigate(`/admin/contracts?id=${item.contractId}`);
        break;
      case 'positions':
        navigate(`/admin/positions?id=${item.positionId}`);
        break;
      default:
        break;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'employees':
        return <FaUser className="text-indigo-500" />;
      case 'departments':
        return <FaBuilding className="text-green-500" />;
      case 'contracts':
        return <FaFileContract className="text-yellow-500" />;
      case 'positions':
        return <FaBriefcase className="text-purple-500" />;
      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const sections = [
      { key: 'employees', title: 'Employees', fields: ['firstName', 'lastName', 'email'] },
      { key: 'departments', title: 'Departments', fields: ['name', 'location'] },
      { key: 'contracts', title: 'Contracts', fields: ['contractType', 'status'] },
      { key: 'positions', title: 'Positions', fields: ['title', 'level'] }
    ];

    // Check if there are any results
    const hasResults = Object.values(results).some(arr => Array.isArray(arr) && arr.length > 0);
    
    if (!hasResults) {
      return (
        <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <p className="text-gray-500 text-center">No results found</p>
        </div>
      );
    }

    return (
      <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
        {sections.map(section => {
          const sectionResults = results[section.key];
          if (!Array.isArray(sectionResults) || sectionResults.length === 0) return null;

          return (
            <div key={section.key} className="p-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
              {sectionResults.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-md"
                  onClick={() => handleResultClick(section.key, item)}
                >
                  <div className="flex-shrink-0 w-8">
                    {getIcon(section.key)}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {section.key === 'employees' 
                        ? `${item.firstName} ${item.lastName}`
                        : section.key === 'departments'
                        ? item.name
                        : section.key === 'contracts'
                        ? `${item.contractType} - ${item.status}`
                        : item.title
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {section.key === 'employees'
                        ? item.email
                        : section.key === 'departments'
                        ? item.location
                        : section.key === 'positions'
                        ? item.level
                        : `${item.employeeFirstName || ''} ${item.employeeLastName || ''}`
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative flex-1 max-w-xl mx-4" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin h-5 w-5 text-gray-400">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <FaSearch className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search employees, departments, contracts, positions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results) setShowResults(true);
          }}
        />
      </div>
      {showResults && renderResults()}
    </div>
  );
};

export default GlobalSearch; 