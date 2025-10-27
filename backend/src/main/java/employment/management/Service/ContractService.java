package employment.management.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import employment.management.Model.Contract;
import employment.management.Model.EContractStatus;
import employment.management.Model.EContractType;
import employment.management.Model.Employee;
import employment.management.Repository.ContractRepository;
import employment.management.Repository.EmployeeRepository;

@Service
public class ContractService {
    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogService auditLogService;

    public String saveContract(Contract contract, UUID employeeId, UUID adminId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return "Employee not found";
        }

        contract.setEmployee(employee.get());
        contractRepository.save(contract);

        auditLogService.logAction("CREATE", "Contract", contract.getContractId(), adminId);
        return "Contract saved successfully";
    }

    public String updateContractStatus(UUID contractId, EContractStatus status, UUID adminId) {
        Optional<Contract> contract = contractRepository.findById(contractId);
        if (contract.isEmpty()) {
            return "Contract not found";
        }

        Contract existingContract = contract.get();
        existingContract.setStatus(status);

        contractRepository.save(existingContract);
        auditLogService.logAction("UPDATE_STATUS", "Contract", contractId, adminId);
        return "Contract status updated successfully";
    }

    public String extendContract(UUID contractId, Date newEndDate, UUID adminId) {
        Optional<Contract> contract = contractRepository.findById(contractId);
        if (contract.isEmpty()) {
            return "Contract not found";
        } 

        Contract existingContract = contract.get();

        if (newEndDate.before(existingContract.getContractEndDate())) {
            return "New end date cannot be before current end date";
        }

        existingContract.setContractEndDate(newEndDate);
        contractRepository.save(existingContract);
        auditLogService.logAction("EXTEND", "Contract", contractId, adminId);
        return "Contract extended successfully";
    }

    public Page<Contract> getAllContracts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return contractRepository.findAll(pageable);
    }

    public Page<Contract> searchContracts(EContractType type, EContractStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return contractRepository.searchContracts(type, status, pageable);
    }

    public Optional<Contract> getContractById(UUID contractId) {
        return contractRepository.findById(contractId);
    }

    public List<Contract> getContractsByEmployee(UUID employeeId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return List.of();
        }  

        return contractRepository.findByEmployee(employee.get());
    }

    public List<Contract> getContractsByType(EContractType contractType) {
        return contractRepository.findByContractType(contractType);
    }

    public List<Contract> getContractsByStatus(EContractStatus status) {
        return contractRepository.findByStatus(status);
    }

    public List<Contract> getExpiredContracts() {
        Date today = new Date();
        return contractRepository.findByContractEndDateBefore(today);
    }

    public String deleteContract(UUID contractId, UUID adminId) {
        if (!contractRepository.existsById(contractId)) {
            return "Contract not found";
        }

        contractRepository.deleteById(contractId);
        auditLogService.logAction("DELETE", "Contract", contractId, adminId);
        return "Contract deleted successfully";
    }

    public long getActiveContractsCount() {
        return contractRepository.findByStatus(EContractStatus.Active).size();
    }

    public List<Contract> getUpcomingExpirations() {
        Date today = new Date();
        Date nextMonth = new Date(today.getTime() + 30L * 24 * 60 * 60 * 1000);
        return contractRepository.findAll().stream()
                .filter(c -> c.getContractEndDate() != null &&
                        c.getContractEndDate().after(today) &&
                        c.getContractEndDate().before(nextMonth))
                .toList();
    }
}