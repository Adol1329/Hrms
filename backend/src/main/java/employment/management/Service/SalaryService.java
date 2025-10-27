package employment.management.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import employment.management.Model.Employee;
import employment.management.Model.Salary;
import employment.management.Repository.EmployeeRepository;
import employment.management.Repository.SalaryRepository;

@Service
public class SalaryService {
    @Autowired
    private SalaryRepository salaryRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogService auditLogService;

    public String saveSalary(Salary salary, UUID employeeId, UUID adminId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return "Employee not found";
        }

        salary.setEmployee(employee.get());
        salaryRepository.save(salary);
        auditLogService.logAction("CREATE", "Salary", salary.getSalaryId(), adminId);
        return "Salary saved successfully";
    }

    public String bulkAdjustSalaries(List<UUID> employeeIds, BigDecimal baseAdjustment, BigDecimal bonusAdjustment, UUID adminId) {
        for (UUID employeeId : employeeIds) {
            Optional<Employee> employee = employeeRepository.findById(employeeId);
            if (employee.isEmpty()) {
                return "Employee not found: " + employeeId;
            }

            List<Salary> salaries = salaryRepository.findByEmployee(employee.get());
            if (salaries.isEmpty()) {
                continue;
            }

            Salary latestSalary = salaries.get(0);
            latestSalary.setBaseSalary(latestSalary.getBaseSalary().add(baseAdjustment));
            if (bonusAdjustment != null) {
                latestSalary.setBonus(latestSalary.getBonus() != null ? latestSalary.getBonus().add(bonusAdjustment) : bonusAdjustment);
            }
            salaryRepository.save(latestSalary);
            auditLogService.logAction("BULK_ADJUST", "Salary", latestSalary.getSalaryId(), adminId);
        }
        return "Bulk salary adjustment successful";
    }

    public String updateSalary(UUID salaryId, Salary salaryDetails, UUID adminId) {
        Optional<Salary> salary = salaryRepository.findById(salaryId);
        if (salary.isEmpty()) {
            return "Salary record not found";
        }    

        Salary existingSalary = salary.get();

        if (salaryDetails.getBaseSalary() != null) {
            existingSalary.setBaseSalary(salaryDetails.getBaseSalary());
        }

        if (salaryDetails.getBonus() != null) {
            existingSalary.setBonus(salaryDetails.getBonus());
        }
        
        if (salaryDetails.getDeductions() != null) {
            existingSalary.setDeductions(salaryDetails.getDeductions());
        }

        salaryRepository.save(existingSalary);
        auditLogService.logAction("UPDATE", "Salary", salaryId, adminId);
        return "Salary updated successfully";
    }

    public Page<Salary> getAllSalaries(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return salaryRepository.findAll(pageable);
    }

    public Page<Salary> searchSalaries(BigDecimal minSalary, BigDecimal maxSalary, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return salaryRepository.searchSalaries(minSalary, maxSalary, pageable);
    }

    public Optional<Salary> getSalaryById(UUID salaryId) {
        return salaryRepository.findById(salaryId);
    }
    
    public List<Salary> getSalariesByEmployee(UUID employeeId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return List.of();
        }

        return salaryRepository.findByEmployee(employee.get());
    }

    public List<Salary> getSalariesAboveThreshold(BigDecimal minSalary) {
        return salaryRepository.findSalariesGreaterThan(minSalary); 
    }

    public BigDecimal getAverageSalaryByDepartment(UUID departmentId) {
        return salaryRepository.findAverageSalaryByDepartment(departmentId); 
    }

    public String deleteSalary(UUID salaryId, UUID adminId) {
        if (!salaryRepository.existsById(salaryId)) {
            return "Salary record not found";
        }

        salaryRepository.deleteById(salaryId);
        auditLogService.logAction("DELETE", "Salary", salaryId, adminId);
        return "Salary record deleted successfully";
    }

    public List<Salary> getAllSalariesNoPagination() {
        return salaryRepository.findAll();
    }
}