package employment.management.Service;

import employment.management.Repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SearchService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final ContractRepository contractRepository;
    private final PositionRepository positionRepository;

    public SearchService(EmployeeRepository employeeRepository,
                        DepartmentRepository departmentRepository,
                        ContractRepository contractRepository,
                        PositionRepository positionRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.contractRepository = contractRepository;
        this.positionRepository = positionRepository;
    }

    public Map<String, Object> globalSearch(String query, Pageable pageable) {
        Map<String, Object> results = new HashMap<>();
        
        results.put("employees", employeeRepository.globalSearch(query, pageable));
        results.put("departments", departmentRepository.globalSearch(query, pageable));
        results.put("contracts", contractRepository.globalSearch(query, pageable));
        results.put("positions", positionRepository.globalSearch(query, pageable));
        
        return results;
    }

    public Page<?> searchEmployees(String query, Pageable pageable) {
        return employeeRepository.globalSearch(query, pageable);
    }

    public Page<?> searchDepartments(String query, Pageable pageable) {
        return departmentRepository.globalSearch(query, pageable);
    }

    public Page<?> searchContracts(String query, Pageable pageable) {
        return contractRepository.globalSearch(query, pageable);
    }

    public Page<?> searchPositions(String query, Pageable pageable) {
        return positionRepository.globalSearch(query, pageable);
    }
} 