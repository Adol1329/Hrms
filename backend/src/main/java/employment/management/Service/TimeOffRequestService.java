package employment.management.Service;

import employment.management.Model.ERequestStatus;
import employment.management.Model.Employee;
import employment.management.Model.TimeOffRequest;
import employment.management.Repository.EmployeeRepository;
import employment.management.Repository.TimeOffRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TimeOffRequestService {
    @Autowired
    private TimeOffRequestRepository timeOffRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public String submitRequest(TimeOffRequest request, UUID employeeId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return "Employee not found";
        }

        request.setEmployee(employee.get());
        request.setStatus(ERequestStatus.Pending);
        request.setLeaveBalance(30); // Default leave balance (simplified)
        timeOffRequestRepository.save(request);
        return "Time-off request submitted successfully";
    }

    public String updateRequestStatus(UUID requestId, ERequestStatus status, UUID adminId) {
        Optional<TimeOffRequest> request = timeOffRequestRepository.findById(requestId);
        if (request.isEmpty()) {
            return "Request not found";
        }

        TimeOffRequest existingRequest = request.get();
        existingRequest.setStatus(status);
        timeOffRequestRepository.save(existingRequest);
        return "Request status updated successfully";
    }

    public List<TimeOffRequest> getRequestsByEmployee(UUID employeeId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return List.of();
        }

        return timeOffRequestRepository.findByEmployee(employee.get());
    }

    public List<TimeOffRequest> getAllRequests() {
        return timeOffRequestRepository.findAll();
    }
}