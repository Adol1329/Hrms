package employment.management.Repository;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import employment.management.Model.Contract;
import employment.management.Model.EContractStatus;
import employment.management.Model.EContractType;
import employment.management.Model.Employee;

@Repository
public interface ContractRepository extends JpaRepository<Contract, UUID> {
    List<Contract> findByEmployee(Employee employee);

    List<Contract> findByContractType(EContractType contractType);
    
    List<Contract> findByStatus(EContractStatus status);

    @NonNull
    List<Contract> findByContractEndDateBefore(Date date);

    @NonNull
    Page<Contract> findAll(@NonNull Pageable pageable);

    @Query("SELECT c FROM Contract c LEFT JOIN FETCH c.employee WHERE " +
           "c.contractType = :type OR " +
           "c.status = :status")
    Page<Contract> searchContracts(EContractType type, EContractStatus status, Pageable pageable);

    long countByStatus(EContractStatus status);
    
    List<Contract> findByContractEndDateBefore(LocalDate date);
    
    List<Contract> findByContractEndDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Contract> findTop10ByOrderByContractStartDateDesc();
    
    @Query("SELECT c FROM Contract c WHERE c.employee.empId = :employeeId AND c.status = 'ACTIVE'")
    Contract findCurrentContract(UUID employeeId);
    
    @Query("SELECT c FROM Contract c LEFT JOIN FETCH c.employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.contractType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.status) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Contract> globalSearch(String query, Pageable pageable);
}