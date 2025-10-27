package employment.management.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import employment.management.Model.Department;
import employment.management.Model.Employee;
import employment.management.Model.Position;
import employment.management.Repository.DepartmentRepository;
import employment.management.Repository.EmployeeRepository;
import employment.management.Repository.PositionRepository;

@Service
public class EmployeeService {
    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private AuditLogService auditLogService;

    public String saveEmployee(Employee employee, UUID departmentId, UUID positionId, UUID adminId) {
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            return "Employee with email: " + employee.getEmail() + " already exists";
        }
    
        Optional<Department> department = departmentRepository.findById(departmentId);
        if (department.isEmpty()) {
            return "Department not found";
        }

        Optional<Position> position = positionRepository.findById(positionId);
        if (position.isEmpty()) {
            return "Position not found";
        }

        employee.setDepartment(department.get());
        employee.setPosition(position.get());
        employeeRepository.save(employee);

        auditLogService.logAction("CREATE", "Employee", employee.getEmpId(), adminId);
        return "Employee saved successfully";
    }

    public String bulkSaveEmployees(List<Employee> employees, UUID departmentId, UUID positionId, UUID adminId) {
        for (Employee employee : employees) {
            String result = saveEmployee(employee, departmentId, positionId, adminId);
            if (!result.equals("Employee saved successfully")) {
                return result;
            }
        }
        return "Bulk employees saved successfully";
    }
 
    public String updateEmployee(UUID employeeId, Employee employeeDetails, UUID adminId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return "Employee not found";
        }
        
        Employee existingEmphasis = employee.get();

        if (employeeDetails.getFirstName() != null) {
            existingEmphasis.setFirstName(employeeDetails.getFirstName());
        }

        if (employeeDetails.getLastName() != null) {
            existingEmphasis.setLastName(employeeDetails.getLastName());
        }

        if (employeeDetails.getGender() != null) {
            existingEmphasis.setGender(employeeDetails.getGender());
        }

        if (employeeDetails.getPhone() != null) {
            existingEmphasis.setPhone(employeeDetails.getPhone());
        }

        if (employeeDetails.getDateOfBirth() != null) {
            existingEmphasis.setDateOfBirth(employeeDetails.getDateOfBirth());
        }

        if (employeeDetails.getHireDate() != null) {
            existingEmphasis.setHireDate(employeeDetails.getHireDate());
        }

        employeeRepository.save(existingEmphasis);
        auditLogService.logAction("UPDATE", "Employee", employeeId, adminId);
        return "Employee updated successfully";
    }

    public String transferEmployee(UUID employeeId, UUID departmentId, UUID positionId, UUID adminId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return "Employee not found"; 
        }

        Optional<Department> department = departmentRepository.findById(departmentId);
        if (department.isEmpty()) {
            return "Department not found";
        }

        Optional<Position> position = positionRepository.findById(positionId);
        if (position.isEmpty()) {
            return "Position not found";
        }

        Employee existingEmployee = employee.get();
        existingEmployee.setDepartment(department.get());
        existingEmployee.setPosition(position.get());

        employeeRepository.save(existingEmployee);
        auditLogService.logAction("TRANSFER", "Employee", employeeId, adminId);
        return "Employee transferred successfully";
    }

    public Page<Employee> getAllEmployees(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return employeeRepository.findAll(pageable);
    }

    public Page<Employee> searchEmployees(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return employeeRepository.globalSearch(searchTerm, pageable);
    }

    public Optional<Employee> getEmployeeById(UUID employeeId) {
        return employeeRepository.findById(employeeId);
    }

    public List<Employee> getEmployeesByDepartment(UUID departmentId) {
        Optional<Department> department = departmentRepository.findById(departmentId);
        if (department.isEmpty()) {
            return List.of();  
        }

        return employeeRepository.findByDepartment(department.get());
    }

    public List<Employee> getEmployeesByPosition(UUID positionId) {
        Optional<Position> position = positionRepository.findById(positionId);
        if (position.isEmpty()) {
            return List.of();
        }
    
        return employeeRepository.findByPosition(position.get());
    }

    public String deleteEmployee(UUID employeeId, UUID adminId) {
        if (!employeeRepository.existsById(employeeId)) {
            return "Employee not found";
        }

        employeeRepository.deleteById(employeeId);
        auditLogService.logAction("DELETE", "Employee", employeeId, adminId);
        return "Employee deleted successfully";
    }

    public long getTotalEmployees() {
        return employeeRepository.count();
    }

    public long getTurnoverRate() {
        // Simplified turnover rate calculation (terminated employees / total employees)
        long totalEmployees = employeeRepository.count();
        long terminatedEmployees = employeeRepository.findAll().stream()
                .filter(e -> e.getTerminationDate() != null)
                .count();
        return totalEmployees == 0 ? 0 : (terminatedEmployees * 100 / totalEmployees);
    }
}