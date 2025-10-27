package employment.management.Service;


import employment.management.Model.EContractStatus;
import employment.management.Model.Employee;
import employment.management.Model.User;
import employment.management.Repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.sql.Date;
import java.util.Optional;

@Service
public class DashboardService {
    private final EmployeeRepository employeeRepository;
    private final ContractRepository contractRepository;
    private final DepartmentRepository departmentRepository;
    private final SalaryRepository salaryRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public DashboardService(EmployeeRepository employeeRepository,
                          ContractRepository contractRepository,
                          DepartmentRepository departmentRepository,
                          SalaryRepository salaryRepository,
                          AuditLogRepository auditLogRepository,
                          UserRepository userRepository) {
        this.employeeRepository = employeeRepository;
        this.contractRepository = contractRepository;
        this.departmentRepository = departmentRepository;
        this.salaryRepository = salaryRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getAdminDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        // Basic statistics
        summary.put("totalEmployees", employeeRepository.count());
        summary.put("totalDepartments", departmentRepository.count());
        summary.put("activeContracts", contractRepository.countByStatus(EContractStatus.Active));
        
        // Recent hires
        summary.put("recentHires", employeeRepository.findAllByOrderByHireDateDesc(PageRequest.of(0, 5)));
        
        // Department distribution
        summary.put("departmentDistribution", employeeRepository.countByDepartment());
        
        // Contract expiration summary
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        summary.put("upcomingExpirations", contractRepository.findByContractEndDateBefore(thirtyDaysFromNow));
        
        return summary;
    }

    public Map<String, Object> getUserDashboardSummary() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> summary = new HashMap<>();

        // Find the user first
        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("Found user with ID: " + currentUser.getUserId());

        // Check if user is linked to an employee
        Employee employee = currentUser.getEmployee();
        System.out.println("Employee link status: " + (employee != null));

        if (employee == null) {
            // Check if there's an employee with matching email that's not linked
            Optional<Employee> matchingEmployee = employeeRepository.findByEmail(currentUserEmail);
            if (matchingEmployee.isPresent()) {
                // Auto-link the employee to the user
                employee = matchingEmployee.get();
                currentUser.setEmployee(employee);
                userRepository.save(currentUser);
                System.out.println("Auto-linked employee with ID: " + employee.getEmpId() + " to user");
            } else {
                summary.put("linkedToEmployee", false);
                summary.put("message", "Your account is not linked to an employee record. Please contact HR if you believe this is an error.");
                return summary;
            }
        }

        // Add employee information to summary
        summary.put("linkedToEmployee", true);
        summary.put("employeeInfo", employee);
        
        // Current contract
        summary.put("currentContract", contractRepository.findCurrentContract(employee.getEmpId()));
        
        // Recent salary information
        summary.put("salaryHistory", salaryRepository.findByEmployee(employee));
        
        // Department information
        if (employee.getDepartment() != null) {
            summary.put("departmentInfo", employee.getDepartment());
            summary.put("departmentColleagues", employeeRepository.findByDepartment(employee.getDepartment()));
        }
        
        return summary;
    }

    public Map<String, Object> getRecentActivities() {
        Map<String, Object> activities = new HashMap<>();
        
        activities.put("recentAuditLogs", auditLogRepository.findTop10ByOrderByTimestampDesc());
        activities.put("recentHires", employeeRepository.findAllByOrderByHireDateDesc(PageRequest.of(0, 5)));
        activities.put("recentContractChanges", contractRepository.findTop10ByOrderByContractStartDateDesc());
        
        return activities;
    }

    public Map<String, Object> getUpcomingEvents() {
        Map<String, Object> events = new HashMap<>();
        
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysFromNow = today.plusDays(30);
        
        events.put("contractExpirations", contractRepository.findByContractEndDateBetween(today, thirtyDaysFromNow));
        events.put("probationEndings", employeeRepository.findByProbationEndDateBetween(
            Date.valueOf(today), 
            Date.valueOf(thirtyDaysFromNow)
        ));
        
        return events;
    }
} 